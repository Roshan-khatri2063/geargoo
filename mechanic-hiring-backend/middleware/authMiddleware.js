const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

const normalizeActiveStatus = (value) =>
  String(value || "active")
    .trim()
    .toLowerCase();

const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer "))
    return res.status(401).json({ message: "Not authorized" });
  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query(
      "SELECT id,name,email,role,active_status FROM users WHERE id=?",
      [decoded.id],
    );
    if (!rows.length)
      return res.status(401).json({ message: "Not authorized" });
    const activeStatus = normalizeActiveStatus(rows[0].active_status);
    if (activeStatus !== "active") {
      return res
        .status(403)
        .json({ message: `Account is ${activeStatus}. Please contact admin.` });
    }
    req.user = rows[0];
    next();
  } catch (err) {
    res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = { protect };
