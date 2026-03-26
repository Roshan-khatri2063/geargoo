const { pool } = require("../config/db");

const parseServiceTypes = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
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

const mapMechanicRow = (row) => ({
  id: row.id,
  name: row.name || row.full_name || "",
  fullName: row.name || row.full_name || "",
  email: row.email || "",
  phone: row.phone || "",
  location:
    row.location ||
    row.address ||
    [row.city, row.state].filter(Boolean).join(", ") ||
    "Location not specified",
  experience:
    Number(row.experience_years ?? row.experience ?? 0) > 0
      ? Number(row.experience_years ?? row.experience)
      : null,
  rating: Number(row.rating_avg ?? row.rating ?? 0),
  specialization: parseServiceTypes(
    row.service_types || row.specialty || row.specialization,
  ),
  approvalStatus:
    String(row.status || "pending").toLowerCase() === "approved" ||
    String(row.status || "pending").toLowerCase() === "active"
      ? "approved"
      : "pending",
  bio: row.bio || "",
  availability:
    row.is_available === 1 || row.is_available === true
      ? "Available"
      : "Unavailable",
  isActive: row.is_available === 1 || row.is_available === true,
});

const getMergedMechanics = async () => {
  const [mechanicUsers] = await pool.query(
    "SELECT * FROM users WHERE LOWER(role) = 'mechanic' ORDER BY id DESC",
  );
  const [profileRows] = await pool.query(
    `SELECT
      m.id,
      m.user_id,
      m.experience_years,
      m.rating_avg,
      m.service_types,
      m.status,
      m.bio,
      u.name,
      u.email,
      u.address,
      u.city,
      u.state
    FROM mechanics m
    LEFT JOIN users u ON u.id = m.user_id
    ORDER BY m.id DESC`,
  );

  const profileByUserId = new Map();
  profileRows.forEach((row) => {
    if (row.user_id != null) profileByUserId.set(Number(row.user_id), row);
  });

  const mergedFromUsers = mechanicUsers.map((user) => {
    const profile = profileByUserId.get(Number(user.id));
    return mapMechanicRow({
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      city: user.city,
      state: user.state,
      location: [user.address, user.city, user.state]
        .filter(Boolean)
        .join(", "),
      experience_years: profile?.experience_years,
      rating_avg: profile?.rating_avg,
      service_types: profile?.service_types,
      status: profile?.status || user.status || "pending",
      bio: profile?.bio,
    });
  });

  const usersSet = new Set(mechanicUsers.map((user) => Number(user.id)));
  const profileOnly = profileRows
    .filter((row) => !usersSet.has(Number(row.user_id)))
    .map((row) =>
      mapMechanicRow({
        ...row,
        location: [row.address, row.city, row.state].filter(Boolean).join(", "),
      }),
    );

  return [...mergedFromUsers, ...profileOnly];
};

const getMechanics = async (req, res, next) => {
  try {
    const mechanics = await getMergedMechanics();

    res.json(mechanics);
  } catch (err) {
    next(err);
  }
};

const getMechanicById = async (req, res, next) => {
  try {
    const mechanicId = Number(req.params.id);
    if (Number.isNaN(mechanicId) || mechanicId <= 0) {
      return res.status(400).json({ message: "Invalid mechanic id" });
    }

    const mechanics = await getMergedMechanics();
    const mechanic = mechanics.find((item) => Number(item.id) === mechanicId);
    if (!mechanic)
      return res.status(404).json({ message: "Mechanic not found" });
    res.json(mechanic);
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const incomingId = Number(req.params.id || req.user?.id);
    if (Number.isNaN(incomingId) || incomingId <= 0) {
      return res.status(400).json({ message: "Invalid mechanic id" });
    }

    const [rows] = await pool.query(
      `SELECT
        m.id,
        m.user_id,
        m.experience_years,
        m.rating_avg,
        m.service_types,
        m.specialty,
        m.status,
        m.bio,
        m.is_available,
        u.name,
        u.email,
        u.phone,
        u.address,
        u.city,
        u.state
      FROM mechanics m
      LEFT JOIN users u ON u.id = m.user_id
      WHERE m.id = ? OR m.user_id = ?
      LIMIT 1`,
      [incomingId, incomingId],
    );

    if (!rows.length)
      return res.status(404).json({ message: "Mechanic not found" });
    const row = rows[0];
    res.json(
      mapMechanicRow({
        ...row,
        location: [row.address, row.city, row.state].filter(Boolean).join(", "),
      }),
    );
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const incomingId = Number(req.params.id || req.user?.id);
    if (Number.isNaN(incomingId) || incomingId <= 0) {
      return res.status(400).json({ message: "Invalid mechanic id" });
    }

    const [mechanicRows] = await pool.query(
      "SELECT id, user_id FROM mechanics WHERE id = ? OR user_id = ? LIMIT 1",
      [incomingId, incomingId],
    );
    if (!mechanicRows.length)
      return res.status(404).json({ message: "Mechanic not found" });

    const mechanic = mechanicRows[0];
    const {
      fullName,
      name,
      email,
      phone,
      skills,
      specialization,
      experience,
      availability,
      bio,
      address,
      city,
      state,
    } = req.body;

    const skillList = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
        ? skills
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : Array.isArray(specialization)
          ? specialization
          : typeof specialization === "string"
            ? specialization
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : [];

    await pool.query(
      "UPDATE mechanics SET service_types = ?, experience_years = ?, is_available = ?, bio = ?, specialty = ? WHERE id = ?",
      [
        skillList.join(","),
        Number(experience) || 0,
        String(availability || "").toLowerCase() === "available" ? 1 : 0,
        bio || null,
        skillList[0] || null,
        mechanic.id,
      ],
    );

    await pool.query(
      "UPDATE users SET name = ?, email = ?, phone = ?, address = ?, city = ?, state = ? WHERE id = ?",
      [
        fullName || name || null,
        email || null,
        phone || null,
        address || null,
        city || null,
        state || null,
        mechanic.user_id,
      ],
    );

    const [updatedRows] = await pool.query(
      `SELECT
        m.id,
        m.user_id,
        m.experience_years,
        m.rating_avg,
        m.service_types,
        m.specialty,
        m.status,
        m.bio,
        m.is_available,
        u.name,
        u.email,
        u.phone,
        u.address,
        u.city,
        u.state
      FROM mechanics m
      LEFT JOIN users u ON u.id = m.user_id
      WHERE m.id = ?
      LIMIT 1`,
      [mechanic.id],
    );

    const updated = updatedRows[0];
    res.json(
      mapMechanicRow({
        ...updated,
        location: [updated.address, updated.city, updated.state]
          .filter(Boolean)
          .join(", "),
      }),
    );
  } catch (err) {
    next(err);
  }
};

const getEarnings = async (req, res, next) => {
  try {
    const incomingId = Number(req.params.id || req.user?.id);
    if (Number.isNaN(incomingId) || incomingId <= 0) {
      return res.status(400).json({ message: "Invalid mechanic id" });
    }

    const [mechanicRows] = await pool.query(
      "SELECT id FROM mechanics WHERE id = ? OR user_id = ? LIMIT 1",
      [incomingId, incomingId],
    );
    if (!mechanicRows.length)
      return res.status(404).json({ message: "Mechanic not found" });
    const mechanicId = mechanicRows[0].id;

    const [tableRows] = await pool.query("SHOW TABLES LIKE 'service_requests'");
    if (!tableRows.length) {
      return res.json({ total: 0, completedJobs: 0, pendingJobs: 0 });
    }

    const [paymentsTableRows] = await pool.query("SHOW TABLES LIKE 'payments'");
    const hasPaymentsTable = paymentsTableRows.length > 0;

    const paidCondition = hasPaymentsTable
      ? "LOWER(COALESCE(p.status, '')) = 'paid'"
      : "LOWER(COALESCE(r.payment_status, '')) = 'paid'";

    const amountExpression = hasPaymentsTable
      ? "COALESCE(p.amount, NULLIF(r.amount, 0), NULLIF(r.final_cost, 0), NULLIF(r.estimated_cost, 0), r.amount, r.final_cost, r.estimated_cost, 0)"
      : "COALESCE(NULLIF(r.amount, 0), NULLIF(r.final_cost, 0), NULLIF(r.estimated_cost, 0), r.amount, r.final_cost, r.estimated_cost, 0)";

    let sql = `SELECT
      COALESCE(SUM(CASE
        WHEN ${paidCondition}
        THEN ${amountExpression}
        ELSE 0
      END), 0) AS total,
      SUM(CASE
        WHEN LOWER(r.status) = 'completed' AND ${paidCondition}
        THEN 1
        ELSE 0
      END) AS completedJobs,
      SUM(CASE WHEN LOWER(r.status) IN ('pending', 'accepted', 'in progress') THEN 1 ELSE 0 END) AS pendingJobs
    FROM service_requests r`;

    if (hasPaymentsTable) {
      sql += `
      LEFT JOIN (
        SELECT request_id, MAX(id) AS latest_id
        FROM payments
        GROUP BY request_id
      ) lp ON lp.request_id = r.id
      LEFT JOIN payments p ON p.id = lp.latest_id`;
    }

    sql += `
    WHERE r.mechanic_id = ?`;

    const [aggRows] = await pool.query(sql, [mechanicId]);

    const agg = aggRows[0] || { total: 0, completedJobs: 0, pendingJobs: 0 };
    res.json({
      total: Number(agg.total || 0),
      completedJobs: Number(agg.completedJobs || 0),
      pendingJobs: Number(agg.pendingJobs || 0),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMechanics,
  getMechanicById,
  getProfile,
  updateProfile,
  getEarnings,
};
