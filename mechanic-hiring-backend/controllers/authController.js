const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

const normalizeActiveStatus = (value) =>
  String(value || "active")
    .trim()
    .toLowerCase();

const normalizeRole = (value) =>
  String(value || "customer")
    .trim()
    .toLowerCase();

const toSkillList = (value) => {
  if (!value) return [];
  if (Array.isArray(value))
    return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const tableExists = async (tableName, connection = pool) => {
  const [rows] = await connection.query("SHOW TABLES LIKE ?", [tableName]);
  return rows.length > 0;
};

const getTableColumns = async (tableName, connection = pool) => {
  const [rows] = await connection.query(`SHOW COLUMNS FROM ${tableName}`);
  return rows.map((row) => row.Field);
};

const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      experience,
      specialization,
      bio,
    } = req.body;

    const normalizedRole = normalizeRole(role);
    const [r] = await pool.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (r.length) return res.status(400).json({ message: "Email exists" });

    const hashed = await bcrypt.hash(password, 10);
    const connection = await pool.getConnection();
    let userId = null;

    try {
      await connection.beginTransaction();

      const userColumns = await getTableColumns("users", connection);
      const userInsertColumns = ["name", "email", "password", "role"];
      const userInsertValues = [name, email, hashed, normalizedRole];

      if (userColumns.includes("phone")) {
        userInsertColumns.push("phone");
        userInsertValues.push(phone || null);
      }
      if (userColumns.includes("active_status")) {
        userInsertColumns.push("active_status");
        userInsertValues.push("active");
      }

      const [userResult] = await connection.query(
        `INSERT INTO users (${userInsertColumns.join(",")}) VALUES (${userInsertColumns.map(() => "?").join(",")})`,
        userInsertValues,
      );
      userId = userResult.insertId;

      if (
        normalizedRole === "mechanic" &&
        (await tableExists("mechanics", connection))
      ) {
        const mechanicColumns = await getTableColumns("mechanics", connection);
        const skillList = toSkillList(specialization);
        const normalizedExperience = Math.max(Number(experience) || 0, 0);

        const mechanicInsertColumns = [];
        const mechanicInsertValues = [];

        if (mechanicColumns.includes("user_id")) {
          mechanicInsertColumns.push("user_id");
          mechanicInsertValues.push(userId);
        }
        if (mechanicColumns.includes("service_types")) {
          mechanicInsertColumns.push("service_types");
          mechanicInsertValues.push(skillList.join(","));
        }
        if (mechanicColumns.includes("specialty")) {
          mechanicInsertColumns.push("specialty");
          mechanicInsertValues.push(skillList[0] || null);
        }
        if (mechanicColumns.includes("experience_years")) {
          mechanicInsertColumns.push("experience_years");
          mechanicInsertValues.push(normalizedExperience);
        }
        if (mechanicColumns.includes("bio")) {
          mechanicInsertColumns.push("bio");
          mechanicInsertValues.push(bio || null);
        }
        if (mechanicColumns.includes("status")) {
          mechanicInsertColumns.push("status");
          mechanicInsertValues.push("Pending");
        }
        if (mechanicColumns.includes("active_status")) {
          mechanicInsertColumns.push("active_status");
          mechanicInsertValues.push("active");
        }

        if (mechanicInsertColumns.length) {
          await connection.query(
            `INSERT INTO mechanics (${mechanicInsertColumns.join(",")}) VALUES (${mechanicInsertColumns.map(() => "?").join(",")})`,
            mechanicInsertValues,
          );
        }
      }

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    const token = jwt.sign(
      { id: userId, role: normalizedRole },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.status(201).json({
      token,
      user: {
        id: userId,
        name,
        email,
        role: normalizedRole,
        activeStatus: "active",
      },
    });
  } catch (err) {
    next(err);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (!users.length)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = users[0];
    const activeStatus = normalizeActiveStatus(user.active_status);
    if (activeStatus !== "active") {
      return res.status(403).json({
        message: `Account is ${activeStatus}. Please contact admin.`,
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(), // normalize to lowercase
        activeStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res) => {
  res.json({ user: req.user });
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    const { fullName, name, email, phone, address, city, state } = req.body;
    const nextName = fullName || name || req.user.name || "";
    const nextEmail = email || req.user.email;

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [nextEmail, userId],
    );
    if (existing.length)
      return res.status(400).json({ message: "Email already in use" });

    await pool.query(
      "UPDATE users SET name = ?, email = ?, phone = ?, address = ?, city = ?, state = ? WHERE id = ?",
      [
        nextName,
        nextEmail,
        phone || null,
        address || null,
        city || null,
        state || null,
        userId,
      ],
    );

    const [rows] = await pool.query(
      "SELECT id, name, email, role, active_status, phone, address, city, state FROM users WHERE id = ?",
      [userId],
    );
    const user = rows[0];

    res.json({
      user: {
        id: user.id,
        name: user.name,
        fullName: user.name,
        email: user.email,
        role: String(user.role || "").toLowerCase(),
        activeStatus: normalizeActiveStatus(user.active_status),
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { registerUser, loginUser, getProfile, updateProfile };
