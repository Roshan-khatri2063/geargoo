const { pool } = require("../config/db");

const REQUESTS_TABLE = "service_requests";
const PAYMENTS_TABLE = "payments";

const normalizeJobStatus = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const canonicalJobStatus = (value) => {
  const normalized = normalizeJobStatus(value);
  const mapping = {
    pending: "Pending",
    accepted: "Accepted",
    "in progress": "In Progress",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    rejected: "Rejected",
  };

  return mapping[normalized] || null;
};

const tableExists = async (tableName) => {
  try {
    const [rows] = await pool.query("SHOW TABLES LIKE ?", [tableName]);
    return rows.length > 0;
  } catch (_err) {
    return false;
  }
};

const mapRequestRow = (row) => ({
  id: row.id,
  service: row.service_type || row.title || "",
  location:
    row.location ||
    row.pickup_address ||
    [row.city, row.state, row.zip].filter(Boolean).join(", ") ||
    "Not specified",
  description: row.description || "",
  status: row.status || "Pending",
  customerId: row.customer_id || null,
  mechanicId: row.mechanic_id || null,
  customerName: row.customerName || "",
  mechanicName: row.mechanicName || "",
  paymentStatus:
    row.latestPaymentStatus ||
    row.payment_status ||
    row.paymentStatus ||
    "unpaid",
  amount: Number(row.amount || row.estimated_cost || row.final_cost || 0),
  currency: row.currency || "NPR",
  lastPaymentId: row.latestPaymentId || row.id || null,
  lastPaidAt: row.latestPaidAt || null,
  createdAt: row.requested_at || row.created_at || null,
});

const resolveMechanicProfileId = async (incomingMechanicId) => {
  const mechanicId = Number(incomingMechanicId);
  if (Number.isNaN(mechanicId) || mechanicId <= 0) return null;

  const [directRows] = await pool.query(
    "SELECT id FROM mechanics WHERE id = ? LIMIT 1",
    [mechanicId],
  );
  if (directRows.length) return directRows[0].id;

  const [byUserRows] = await pool.query(
    "SELECT id FROM mechanics WHERE user_id = ? LIMIT 1",
    [mechanicId],
  );
  if (byUserRows.length) return byUserRows[0].id;

  const [usersRows] = await pool.query(
    "SELECT id, role FROM users WHERE id = ? LIMIT 1",
    [mechanicId],
  );
  if (!usersRows.length) return null;

  if (String(usersRows[0].role || "").toLowerCase() !== "mechanic") return null;

  const [insertResult] = await pool.query(
    "INSERT INTO mechanics (user_id) VALUES (?)",
    [mechanicId],
  );
  return insertResult.insertId;
};

const createRequest = async (req, res, next) => {
  const { service, location, description, mechanicId, customerId } = req.body;

  if (!service || !location || !mechanicId || !customerId) {
    return res.status(400).json({
      message: "Please provide customer, service, location, and mechanic",
    });
  }

  try {
    const hasRequestsTable = await tableExists(REQUESTS_TABLE);
    if (!hasRequestsTable) {
      return res.status(503).json({
        message:
          "Requests feature is not available yet. Database table 'service_requests' was not found.",
      });
    }

    const resolvedMechanicId = await resolveMechanicProfileId(mechanicId);
    if (!resolvedMechanicId) {
      return res.status(400).json({ message: "Selected mechanic is invalid" });
    }

    const [result] = await pool.query(
      `INSERT INTO ${REQUESTS_TABLE} 
      (customer_id, mechanic_id, title, service_type, description, pickup_address, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId,
        resolvedMechanicId,
        service,
        service,
        description || "",
        location,
        "Pending",
      ],
    );

    const [rows] = await pool.query(
      `SELECT * FROM ${REQUESTS_TABLE} WHERE id = ?`,
      [result.insertId],
    );

    res.status(201).json(mapRequestRow(rows[0] || {}));
  } catch (err) {
    next(err);
  }
};

const getUserRequests = async (req, res, next) => {
  try {
    const hasRequestsTable = await tableExists(REQUESTS_TABLE);
    if (!hasRequestsTable) return res.json([]);
    const hasPaymentsTable = await tableExists(PAYMENTS_TABLE);

    const customerId = Number(req.query.customerId);
    let sql = `SELECT 
      r.*,
      COALESCE(c.name, '') AS customerName,
      COALESCE(mu.name, '') AS mechanicName`;

    if (hasPaymentsTable) {
      sql += `,
      p.id AS latestPaymentId,
      p.status AS latestPaymentStatus,
      p.paid_at AS latestPaidAt`;
    }

    sql += `
      FROM service_requests r
      LEFT JOIN users c ON c.id = r.customer_id
      LEFT JOIN mechanics m ON m.id = r.mechanic_id
      LEFT JOIN users mu ON mu.id = m.user_id`;

    if (hasPaymentsTable) {
      sql += `
      LEFT JOIN (
        SELECT request_id, MAX(id) AS latest_id
        FROM payments
        GROUP BY request_id
      ) lp ON lp.request_id = r.id
      LEFT JOIN payments p ON p.id = lp.latest_id`;
    }

    const params = [];

    if (!Number.isNaN(customerId) && customerId > 0) {
      sql += " WHERE r.customer_id = ?";
      params.push(customerId);
    }

    sql += " ORDER BY r.id DESC";
    const [rows] = await pool.query(sql, params);
    res.json(rows.map(mapRequestRow));
  } catch (err) {
    next(err);
  }
};

const getMechanicJobs = async (req, res, next) => {
  try {
    const hasRequestsTable = await tableExists(REQUESTS_TABLE);
    if (!hasRequestsTable) return res.json([]);
    const hasPaymentsTable = await tableExists(PAYMENTS_TABLE);

    const incomingId = Number(req.params.mechanicId || req.query.mechanicId);
    if (Number.isNaN(incomingId) || incomingId <= 0) {
      return res.status(400).json({ message: "Invalid mechanic id" });
    }

    const mechanicId = await resolveMechanicProfileId(incomingId);
    if (!mechanicId) return res.json([]);

    let sql = `SELECT 
        r.*,
        COALESCE(c.name, '') AS customerName,
        COALESCE(mu.name, '') AS mechanicName`;

    if (hasPaymentsTable) {
      sql += `,
        p.id AS latestPaymentId,
        p.status AS latestPaymentStatus,
        p.paid_at AS latestPaidAt`;
    }

    sql += `
      FROM service_requests r
      LEFT JOIN users c ON c.id = r.customer_id
      LEFT JOIN mechanics m ON m.id = r.mechanic_id
      LEFT JOIN users mu ON mu.id = m.user_id
      `;

    if (hasPaymentsTable) {
      sql += `
      LEFT JOIN (
        SELECT request_id, MAX(id) AS latest_id
        FROM payments
        GROUP BY request_id
      ) lp ON lp.request_id = r.id
      LEFT JOIN payments p ON p.id = lp.latest_id
      `;
    }

    sql += `
      WHERE r.mechanic_id = ?
      ORDER BY r.id DESC`;

    const [rows] = await pool.query(sql, [mechanicId]);

    res.json(rows.map(mapRequestRow));
  } catch (err) {
    next(err);
  }
};

const updateJobStatus = async (req, res, next) => {
  try {
    const hasRequestsTable = await tableExists(REQUESTS_TABLE);
    if (!hasRequestsTable) {
      return res
        .status(503)
        .json({ message: "service_requests table not found" });
    }

    const requestId = Number(req.params.id);
    const { status } = req.body;
    if (Number.isNaN(requestId) || requestId <= 0) {
      return res.status(400).json({ message: "Invalid request id" });
    }
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const nextStatus = canonicalJobStatus(status);
    if (!nextStatus) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const [existingRows] = await pool.query(
      `SELECT id, status FROM ${REQUESTS_TABLE} WHERE id = ? LIMIT 1`,
      [requestId],
    );

    if (!existingRows.length) {
      return res.status(404).json({ message: "Request not found" });
    }

    const currentStatus = normalizeJobStatus(existingRows[0].status);
    const nextNormalized = normalizeJobStatus(nextStatus);

    if (currentStatus === nextNormalized) {
      return res.json({ message: "Status already updated" });
    }

    const blockedFinalStates = new Set(["completed", "cancelled", "rejected"]);
    if (blockedFinalStates.has(currentStatus)) {
      return res.status(400).json({
        message: `Cannot change status after ${existingRows[0].status}`,
      });
    }

    const allowedTransitions = {
      pending: new Set(["accepted", "cancelled", "rejected"]),
      accepted: new Set(["in progress", "completed", "cancelled"]),
      "in progress": new Set(["completed", "cancelled"]),
    };

    const allowedNext = allowedTransitions[currentStatus] || new Set();
    if (!allowedNext.has(nextNormalized)) {
      return res.status(400).json({
        message: `Invalid transition from ${existingRows[0].status} to ${nextStatus}`,
      });
    }

    const [result] = await pool.query(
      `UPDATE ${REQUESTS_TABLE} SET status = ? WHERE id = ?`,
      [nextStatus, requestId],
    );

    res.json({ message: "Status updated successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRequest,
  getUserRequests,
  getMechanicJobs,
  updateJobStatus,
};
