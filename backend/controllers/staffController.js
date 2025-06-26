// backend/controllers/staffController.js
import db from "../config/db.js";
import bcrypt from "bcryptjs";

/* ───────── Validators ───────── */
const alphaNum = /^[A-Za-z0-9_]+$/;
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[0-9]{10}$/;

const validate = (s) => {
  if (!alphaNum.test(s.username)) return "Invalid username";
  if (s.password.length < 4) return "Password min 4 chars";
  if (!emailRe.test(s.email)) return "Invalid email";
  if (!phoneRe.test(s.phone)) return "Phone must be 10 digits";
  return null;
};

/* ---------- ADD  (POST /api/staff/add) ---------- */
/* ---------- ADD  (POST /api/staff/add) ---------- */
export const addStaff = async (req, res) => {
  const err = validate(req.body || {});
  if (err) return res.status(400).json({ msg: err });

  const { username, password, email, phone, role = "staff" } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password.trim(), salt);

    // 1. Staff table me insert karo
    const [{ insertId }] = await db.query(
      `INSERT INTO staff (username,password,email,phone,role)
       VALUES (?,?,?,?,?)`,
      [username.trim(), hashed, email.trim(), phone.trim(), role]
    );

    // 2. Users table me bhi insert karo for login
    await db.query(
      `INSERT INTO users (id, username, email, password, role, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [insertId, username.trim(), email.trim(), hashed, "staff"]
    );

    res
      .status(201)
      .json({ id: insertId, msg: "✅ Staff added & user created" });
  } catch (e) {
    console.error("ADD STAFF ERR:", e);
    if (e.code === "ER_DUP_ENTRY")
      return res
        .status(409)
        .json({ msg: "Username / Email / Phone already exists" });
    res.status(500).json({ msg: "Server error" });
  }
};

/* ---------- LIST (GET /api/staff) --------------- */
export const getAllStaff = async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM staff ORDER BY id DESC");
    res.json(rows);
  } catch (e) {
    console.error("GET STAFF ERR:", e);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ---------- SINGLE (GET /api/staff/:id) --------- */
export const getStaffById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM staff WHERE id=?", [
      req.params.id,
    ]);
    if (!rows.length) return res.status(404).json({ msg: "Staff not found" });
    res.json(rows[0]);
  } catch (e) {
    console.error("GET STAFF BY ID ERR:", e);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ---------- UPDATE (PUT /api/staff/:id) --------- */
export const updateStaff = async (req, res) => {
  const { username, password, email, phone, role = "staff" } = req.body;

  if (!username || !email || !phone) {
    return res.status(400).json({ msg: "Username, email, phone required" });
  }
  if (!alphaNum.test(username))
    return res.status(400).json({ msg: "Invalid username" });
  if (!emailRe.test(email))
    return res.status(400).json({ msg: "Invalid email" });
  if (!phoneRe.test(phone))
    return res.status(400).json({ msg: "Phone must be 10 digits" });

  try {
    let hashed = null;
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      hashed = await bcrypt.hash(password.trim(), salt);
    }

    // Update staff table
    let query = "";
    let params = [];

    if (hashed) {
      query = `UPDATE staff SET username=?, password=?, email=?, phone=?, role=? WHERE id=?`;
      params = [
        username.trim(),
        hashed,
        email.trim(),
        phone.trim(),
        role,
        req.params.id,
      ];
    } else {
      query = `UPDATE staff SET username=?, email=?, phone=?, role=? WHERE id=?`;
      params = [
        username.trim(),
        email.trim(),
        phone.trim(),
        role,
        req.params.id,
      ];
    }

    const [up] = await db.query(query, params);
    if (!up.affectedRows)
      return res.status(404).json({ msg: "Staff not found" });

    // Update users table
    if (hashed) {
      await db.query(
        `UPDATE users SET username=?, email=?, password=? WHERE id=?`,
        [username.trim(), email.trim(), hashed, req.params.id]
      );
    } else {
      await db.query(`UPDATE users SET username=?, email=? WHERE id=?`, [
        username.trim(),
        email.trim(),
        req.params.id,
      ]);
    }

    res.json({ msg: "✅ Staff & user updated" });
  } catch (e) {
    console.error("UPDATE STAFF ERR:", e);
    if (e.code === "ER_DUP_ENTRY")
      return res
        .status(409)
        .json({ msg: "Username / Email / Phone already exists" });
    res.status(500).json({ msg: "Server error" });
  }
};

// ---------- DELETE (DELETE /api/staff/:id) ----------
export const deleteStaff = async (req, res) => {
  try {
    // First delete from users table
    await db.query("DELETE FROM users WHERE id=?", [req.params.id]);

    // Then delete from staff table
    const [del] = await db.query("DELETE FROM staff WHERE id=?", [
      req.params.id,
    ]);
    if (!del.affectedRows)
      return res.status(404).json({ msg: "Staff not found" });

    res.json({ msg: "✅ Staff deleted from both tables" });
  } catch (e) {
    console.error("DELETE STAFF ERR:", e);
    res.status(500).json({ msg: "Server error" });
  }
};
