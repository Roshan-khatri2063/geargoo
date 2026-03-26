const { pool } = require("../config/db");
const REQUESTS_TABLE = "service_requests";

const toSkillsArray = (skills) => {
  if (Array.isArray(skills)) return skills;
  if (!skills) return [];

  if (typeof skills === "string") {
    const trimmed = skills.trim();
    if (!trimmed) return [];

    // Handle JSON arrays stored as text.
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [];
      } catch (_err) {
        return trimmed
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeStatus = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const normalizeRole = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const ACTIVE_STATUS_VALUES = ["active", "inactive", "banned"];

const normalizeActiveStatus = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return ACTIVE_STATUS_VALUES.includes(normalized) ? normalized : null;
};

const titleCase = (value) => {
  const normalized = normalizeStatus(value);
  if (!normalized) return "Pending";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const isCompletedStatus = (status) => {
  const normalized = normalizeStatus(status);
  return (
    normalized === "completed" ||
    normalized === "complete" ||
    normalized === "done"
  );
};

const monthKeysForLastYear = () => {
  const keys = [];
  const now = new Date();
  for (let i = 11; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
    );
  }
  return keys;
};

const monthLabel = (monthKey) => {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString("en-US", { month: "short", year: "numeric" });
};

const parseRequestDate = (request) => {
  const candidates = [
    request.created_at,
    request.createdAt,
    request.requested_at,
    request.requestedAt,
    request.date,
  ];

  for (const value of candidates) {
    if (!value) continue;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
};

const parseDateValue = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const getRangeBounds = ({ range, startDate, endDate }) => {
  const now = new Date();
  let start = null;
  let end = null;

  if (range === "7d") {
    start = new Date(now);
    start.setDate(start.getDate() - 7);
    end = now;
  } else if (range === "30d") {
    start = new Date(now);
    start.setDate(start.getDate() - 30);
    end = now;
  } else if (range === "90d") {
    start = new Date(now);
    start.setDate(start.getDate() - 90);
    end = now;
  } else if (range === "this_month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = now;
  }

  if (startDate) {
    const parsedStart = parseDateValue(startDate);
    if (parsedStart) start = parsedStart;
  }

  if (endDate) {
    const parsedEnd = parseDateValue(endDate);
    if (parsedEnd) end = parsedEnd;
  }

  return { start, end };
};

const inRange = (value, { start, end }) => {
  if (!start && !end) return true;
  const date = parseDateValue(value);
  if (!date) return false;
  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
};

const buildJobsPerMonth = (requests) => {
  const keys = monthKeysForLastYear();
  const counts = Object.fromEntries(keys.map((key) => [key, 0]));

  requests.forEach((request) => {
    const date = parseRequestDate(request);
    if (!date) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (key in counts) counts[key] += 1;
  });

  return keys.map((key) => ({
    month: monthLabel(key),
    jobs: counts[key],
  }));
};

const getTableColumns = async (tableName) => {
  const allowed = ["users", "mechanics", "service_requests"];
  if (!allowed.includes(tableName)) return [];

  try {
    const [rows] = await pool.query(`SHOW COLUMNS FROM ${tableName}`);
    return rows.map((row) => row.Field);
  } catch (_err) {
    return [];
  }
};

const tableExists = async (tableName) => {
  try {
    const [rows] = await pool.query("SHOW TABLES LIKE ?", [tableName]);
    return rows.length > 0;
  } catch (_err) {
    return false;
  }
};

const syncActiveStatusColumns = async () => {
  const usersColumns = await getTableColumns("users");
  if (usersColumns.length && !usersColumns.includes("active_status")) {
    await pool.query(
      "ALTER TABLE users ADD COLUMN active_status ENUM('active','inactive','banned') NOT NULL DEFAULT 'active'",
    );
  }

  const mechanicsColumns = await getTableColumns("mechanics");
  if (mechanicsColumns.length && !mechanicsColumns.includes("active_status")) {
    await pool.query(
      "ALTER TABLE mechanics ADD COLUMN active_status ENUM('active','inactive','banned') NOT NULL DEFAULT 'active'",
    );
  }
};

const getAllRequests = async () => {
  const hasRequestsTable = await tableExists(REQUESTS_TABLE);
  if (!hasRequestsTable) return [];

  const [rows] = await pool.query(
    `SELECT 
      r.*, 
      COALESCE(c.name, '') AS customerName,
      COALESCE(mu.name, '') AS mechanicName
    FROM service_requests r
    LEFT JOIN users c ON c.id = r.customer_id
      LEFT JOIN mechanics m ON m.id = r.mechanic_id
      LEFT JOIN users mu ON mu.id = m.user_id
    ORDER BY r.id DESC`,
  );

  return rows.map((request) => ({
    id: request.id,
    service: request.service_type || request.title || "",
    customerName: request.customerName || "",
    mechanicName: request.mechanicName || "",
    location:
      request.location ||
      request.pickup_address ||
      [request.city, request.state, request.zip].filter(Boolean).join(", ") ||
      "Not specified",
    status: titleCase(request.status),
    createdAt:
      request.requested_at || request.created_at || request.createdAt || null,
  }));
};

const getAllMechanics = async () => {
  const [mechanicUsers] = await pool.query(
    "SELECT * FROM users WHERE LOWER(role) = 'mechanic' ORDER BY id DESC",
  );
  const [mechanicRows] = await pool.query(
    "SELECT * FROM mechanics ORDER BY id DESC",
  );

  const byUserId = new Map();
  const byEmail = new Map();
  const byName = new Map();

  mechanicRows.forEach((mechanic) => {
    if (mechanic.user_id != null)
      byUserId.set(Number(mechanic.user_id), mechanic);
    if (mechanic.email)
      byEmail.set(String(mechanic.email).toLowerCase(), mechanic);
    if (mechanic.name)
      byName.set(String(mechanic.name).toLowerCase(), mechanic);
    if (mechanic.full_name)
      byName.set(String(mechanic.full_name).toLowerCase(), mechanic);
  });

  const matchedMechanicIds = new Set();

  const merged = mechanicUsers.map((user) => {
    const userName = user.full_name || user.fullName || user.name || "";
    const profile =
      byUserId.get(Number(user.id)) ||
      byEmail.get(String(user.email || "").toLowerCase()) ||
      byName.get(String(userName).toLowerCase()) ||
      null;

    if (profile?.id != null) matchedMechanicIds.add(Number(profile.id));

    const rawStatus =
      profile?.status ||
      profile?.approval_status ||
      profile?.approvalStatus ||
      user.status ||
      user.approval_status ||
      user.approvalStatus ||
      "Pending";

    const activeStatus =
      normalizeActiveStatus(profile?.active_status) ||
      normalizeActiveStatus(user.active_status) ||
      "active";

    return {
      id: user.id,
      userId: user.id,
      mechanicId: profile?.id || null,
      fullName: userName,
      email: user.email || profile?.email || "",
      skills: toSkillsArray(
        profile?.service_types || profile?.skills || profile?.specialty,
      ),
      experience:
        Number(profile?.experience_years ?? profile?.experience ?? 0) > 0
          ? Number(profile?.experience_years ?? profile?.experience)
          : "",
      availability:
        typeof profile?.is_available !== "undefined"
          ? Number(profile.is_available) === 1
            ? "Available"
            : "Unavailable"
          : profile?.availability || "",
      status: titleCase(rawStatus),
      activeStatus,
      createdAt: user.created_at || profile?.created_at || null,
    };
  });

  // Include mechanics that do not have a matching user row.
  mechanicRows.forEach((mechanic) => {
    if (matchedMechanicIds.has(Number(mechanic.id))) return;
    merged.push({
      id: mechanic.user_id || mechanic.id,
      userId: mechanic.user_id || null,
      mechanicId: mechanic.id,
      fullName: mechanic.full_name || mechanic.fullName || mechanic.name || "",
      email: mechanic.email || "",
      skills: toSkillsArray(
        mechanic.service_types || mechanic.skills || mechanic.specialty,
      ),
      experience:
        Number(mechanic.experience_years ?? mechanic.experience ?? 0) > 0
          ? Number(mechanic.experience_years ?? mechanic.experience)
          : "",
      availability:
        typeof mechanic.is_available !== "undefined"
          ? Number(mechanic.is_available) === 1
            ? "Available"
            : "Unavailable"
          : mechanic.availability || "",
      status: titleCase(
        mechanic.status ||
          mechanic.approval_status ||
          mechanic.approvalStatus ||
          "Pending",
      ),
      activeStatus: normalizeActiveStatus(mechanic.active_status) || "active",
      createdAt: mechanic.created_at || null,
    });
  });

  return merged;
};

const getUsers = async (req, res, next) => {
  try {
    await syncActiveStatusColumns();
    const [rows] = await pool.query("SELECT * FROM users ORDER BY id DESC");
    const users = rows.map((user) => ({
      id: user.id,
      fullName: user.full_name || user.fullName || user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "",
      activeStatus: normalizeActiveStatus(user.active_status) || "active",
    }));

    res.json(users);
  } catch (err) {
    next(err);
  }
};

const getCustomers = async (req, res, next) => {
  try {
    await syncActiveStatusColumns();
    const [rows] = await pool.query("SELECT * FROM users ORDER BY id DESC");
    const customers = rows
      .filter((user) => normalizeRole(user.role) === "customer")
      .map((user) => ({
        id: user.id,
        fullName: user.full_name || user.fullName || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "",
        activeStatus: normalizeActiveStatus(user.active_status) || "active",
      }));

    res.json(customers);
  } catch (err) {
    next(err);
  }
};

const getMechanics = async (req, res, next) => {
  try {
    await syncActiveStatusColumns();
    const mechanics = await getAllMechanics();
    res.json(mechanics);
  } catch (err) {
    next(err);
  }
};

const getRequests = async (req, res, next) => {
  try {
    const requests = await getAllRequests();
    res.json(requests);
  } catch (err) {
    next(err);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    // Defensive query for created date field naming differences (created_at VS createdAt)
    let usersRows = [];

    try {
      [usersRows] = await pool.query("SELECT id, role, created_at FROM users");
    } catch (err) {
      const [usersFallbackRows] = await pool.query(
        "SELECT id, role, createdAt AS created_at FROM users",
      );
      usersRows = usersFallbackRows;
    }

    const mechanicsRows = await getAllMechanics();
    const requestRows = await getAllRequests();
    const rangeKey = String(req.query.range || "all").toLowerCase();
    const rangeBounds = getRangeBounds({
      range: rangeKey,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    });

    const usersInRange = usersRows.filter((user) =>
      inRange(user.created_at, rangeBounds),
    );
    const mechanicsInRange = mechanicsRows.filter((mechanic) =>
      inRange(mechanic.createdAt, rangeBounds),
    );
    const requestsInRange = requestRows.filter((request) =>
      inRange(request.createdAt, rangeBounds),
    );

    const customers = usersInRange.filter(
      (user) => normalizeRole(user.role) === "customer",
    ).length;

    const completed = requestsInRange.filter((request) =>
      isCompletedStatus(request.status),
    ).length;
    const jobsPerMonth = buildJobsPerMonth(requestsInRange);
    const pendingActions = {
      pendingMechanics: mechanicsInRange.filter(
        (mechanic) => normalizeStatus(mechanic.status) === "pending",
      ).length,
      pendingRequests: requestsInRange.filter(
        (request) => normalizeStatus(request.status) === "pending",
      ).length,
      stalePendingRequests: requestsInRange.filter((request) => {
        if (normalizeStatus(request.status) !== "pending") return false;
        const createdAt = parseDateValue(request.createdAt);
        if (!createdAt) return false;
        const hoursSinceCreation =
          (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
        return hoursSinceCreation >= 48;
      }).length,
      unassignedRequests: requestsInRange.filter(
        (request) => !String(request.mechanicName || "").trim(),
      ).length,
    };

    res.json({
      stats: {
        users: usersInRange.length,
        customers,
        mechanics: mechanicsInRange.length,
        requests: requestsInRange.length,
        completed,
      },
      pendingActions,
      appliedRange: rangeKey,
      jobsPerMonth,
    });
  } catch (err) {
    next(err);
  }
};

const deleteRequest = async (req, res, next) => {
  try {
    const hasRequestsTable = await tableExists(REQUESTS_TABLE);
    if (!hasRequestsTable) {
      return res
        .status(404)
        .json({ message: "service_requests table not found" });
    }

    const { id } = req.params;
    const [result] = await pool.query(
      `DELETE FROM ${REQUESTS_TABLE} WHERE id = ?`,
      [id],
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({ message: "Request deleted successfully" });
  } catch (err) {
    next(err);
  }
};

const approveMechanic = async (req, res, next) => {
  try {
    await syncActiveStatusColumns();
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: "Invalid mechanic id" });
    }

    const [userRows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    if (!userRows.length) {
      return res.status(404).json({ message: "Mechanic user not found" });
    }

    const userColumns = await getTableColumns("users");
    const userUpdates = ["role = ?"];
    const userValues = ["mechanic"];
    if (userColumns.includes("active_status")) {
      userUpdates.push("active_status = ?");
      userValues.push("active");
    }
    await pool.query(
      `UPDATE users SET ${userUpdates.join(", ")} WHERE id = ?`,
      [...userValues, userId],
    );

    const mechanicColumns = await getTableColumns("mechanics");
    if (mechanicColumns.length) {
      const updates = [];
      const values = [];

      if (mechanicColumns.includes("status")) {
        updates.push("status = ?");
        values.push("Approved");
      }
      if (mechanicColumns.includes("approval_status")) {
        updates.push("approval_status = ?");
        values.push("approved");
      }
      if (mechanicColumns.includes("approvalStatus")) {
        updates.push("approvalStatus = ?");
        values.push("approved");
      }
      if (mechanicColumns.includes("active_status")) {
        updates.push("active_status = ?");
        values.push("active");
      }

      if (updates.length) {
        if (mechanicColumns.includes("user_id")) {
          const [updateResult] = await pool.query(
            `UPDATE mechanics SET ${updates.join(", ")} WHERE user_id = ?`,
            [...values, userId],
          );

          // Some accounts only exist in users; create a mechanics profile row on approval.
          if (!updateResult.affectedRows) {
            const insertColumns = [];
            const placeholders = [];
            const insertValues = [];

            if (mechanicColumns.includes("user_id")) {
              insertColumns.push("user_id");
              placeholders.push("?");
              insertValues.push(userId);
            }
            if (mechanicColumns.includes("status")) {
              insertColumns.push("status");
              placeholders.push("?");
              insertValues.push("Approved");
            }
            if (mechanicColumns.includes("service_types")) {
              insertColumns.push("service_types");
              placeholders.push("?");
              insertValues.push(null);
            }
            if (mechanicColumns.includes("experience_years")) {
              insertColumns.push("experience_years");
              placeholders.push("?");
              insertValues.push(null);
            }
            if (mechanicColumns.includes("active_status")) {
              insertColumns.push("active_status");
              placeholders.push("?");
              insertValues.push("active");
            }

            if (insertColumns.length) {
              await pool.query(
                `INSERT INTO mechanics (${insertColumns.join(", ")}) VALUES (${placeholders.join(", ")})`,
                insertValues,
              );
            }
          }
        } else {
          await pool.query(
            `UPDATE mechanics SET ${updates.join(", ")} WHERE id = ?`,
            [...values, userId],
          );
        }
      }
    }

    res.json({ message: "Mechanic approved successfully" });
  } catch (err) {
    next(err);
  }
};

const updateCustomerActiveStatus = async (req, res, next) => {
  try {
    await syncActiveStatusColumns();

    const customerId = Number(req.params.id);
    if (Number.isNaN(customerId) || customerId <= 0) {
      return res.status(400).json({ message: "Invalid customer id" });
    }

    const activeStatus = normalizeActiveStatus(req.body?.activeStatus);
    if (!activeStatus) {
      return res.status(400).json({
        message: "activeStatus must be one of: active, inactive, banned",
      });
    }

    const [userRows] = await pool.query(
      "SELECT id, role FROM users WHERE id = ? LIMIT 1",
      [customerId],
    );

    if (!userRows.length) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (normalizeRole(userRows[0].role) !== "customer") {
      return res
        .status(400)
        .json({ message: "Selected user is not a customer" });
    }

    await pool.query("UPDATE users SET active_status = ? WHERE id = ?", [
      activeStatus,
      customerId,
    ]);

    return res.json({
      message: "Customer active status updated",
      id: customerId,
      activeStatus,
    });
  } catch (err) {
    next(err);
  }
};

const updateMechanicActiveStatus = async (req, res, next) => {
  try {
    await syncActiveStatusColumns();

    const userId = Number(req.params.id);
    if (Number.isNaN(userId) || userId <= 0) {
      return res.status(400).json({ message: "Invalid mechanic id" });
    }

    const activeStatus = normalizeActiveStatus(req.body?.activeStatus);
    if (!activeStatus) {
      return res.status(400).json({
        message: "activeStatus must be one of: active, inactive, banned",
      });
    }

    const [userRows] = await pool.query(
      "SELECT id, role FROM users WHERE id = ? LIMIT 1",
      [userId],
    );
    if (!userRows.length) {
      return res.status(404).json({ message: "Mechanic user not found" });
    }

    if (normalizeRole(userRows[0].role) !== "mechanic") {
      return res
        .status(400)
        .json({ message: "Selected user is not a mechanic" });
    }

    await pool.query("UPDATE users SET active_status = ? WHERE id = ?", [
      activeStatus,
      userId,
    ]);

    const mechanicColumns = await getTableColumns("mechanics");
    if (mechanicColumns.includes("active_status")) {
      if (mechanicColumns.includes("user_id")) {
        await pool.query(
          "UPDATE mechanics SET active_status = ? WHERE user_id = ?",
          [activeStatus, userId],
        );
      } else {
        await pool.query(
          "UPDATE mechanics SET active_status = ? WHERE id = ?",
          [activeStatus, userId],
        );
      }
    }

    return res.json({
      message: "Mechanic active status updated",
      id: userId,
      activeStatus,
    });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await syncActiveStatusColumns();
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const [userRows] = await pool.query(
      "SELECT id, role FROM users WHERE id = ?",
      [userId],
    );
    if (!userRows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const mechanicColumns = await getTableColumns("mechanics");
    const requestColumns = await getTableColumns(REQUESTS_TABLE);

    if (requestColumns.includes("customer_id")) {
      await pool.query(`DELETE FROM ${REQUESTS_TABLE} WHERE customer_id = ?`, [
        userId,
      ]);
    }

    if (mechanicColumns.includes("user_id")) {
      const [mechanicRows] = await pool.query(
        "SELECT id FROM mechanics WHERE user_id = ?",
        [userId],
      );

      if (requestColumns.includes("mechanic_id") && mechanicRows.length) {
        const mechanicIds = mechanicRows.map((row) => row.id);
        await pool.query(
          `DELETE FROM ${REQUESTS_TABLE} WHERE mechanic_id IN (?)`,
          [mechanicIds],
        );
      }

      await pool.query("DELETE FROM mechanics WHERE user_id = ?", [userId]);
    } else {
      if (requestColumns.includes("mechanic_id")) {
        await pool.query(
          `DELETE FROM ${REQUESTS_TABLE} WHERE mechanic_id = ?`,
          [userId],
        );
      }
      await pool.query("DELETE FROM mechanics WHERE id = ?", [userId]);
    }

    await pool.query("DELETE FROM users WHERE id = ?", [userId]);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

const getAdminDashboard = async (req, res, next) => {
  try {
    await syncActiveStatusColumns();
    const [rows] = await pool.query("SELECT * FROM users ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminDashboard,
  getUsers,
  getCustomers,
  getMechanics,
  getRequests,
  getDashboardStats,
  deleteRequest,
  approveMechanic,
  updateCustomerActiveStatus,
  updateMechanicActiveStatus,
  deleteUser,
};
