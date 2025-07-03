// backend/controllers/authController.js
import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { sendOTPEmail } from "../utils/sendEmail.js";
// import { sendOTPSMS } from "../utils/sendSMS.js"; // optional

const otpStore = new Map(); // { email → { otp, generatedAt, verified } }

/* ──────────────────────────────
   HELPER: add entry in login_logs
──────────────────────────────── */
const addLoginLog = async (user_id, username, role, ip, action = "login") => {
  await pool.query(
    `INSERT INTO login_logs
       (user_id, username, role, ip_address, action)
     VALUES (?,?,?,?,?)`,
    [user_id, username, role, ip, action]
  );
};

/* ──────────────────────────────
   POST /api/auth/login
──────────────────────────────── */
export const login = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  let tableName = "";
  if (role === "superadmin") tableName = "users";
  else if (role === "staff") tableName = "staff";
  else return res.status(400).json({ message: "Invalid role" });

  const [rows] = await pool.query(
    `SELECT * FROM ${tableName} WHERE username = ?`,
    [username]
  );

  const user = rows[0];

  // 👇 Combine all error checks into one
  if (
    rows.length === 0 || // username not found
    user.role?.toLowerCase() !== role.toLowerCase() || // role mismatch
    !(await bcrypt.compare(password, user.password)) // password wrong
  ) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  await addLoginLog(user.id, user.username, role, req.ip, "login");

  const token = generateToken({ id: user.id, role });
  const { password: _, ...safeUser } = user;

  res.json({ token, user: safeUser });
};

/* ──────────────────────────────
   POST /api/auth/logout
──────────────────────────────── */
export const logout = async (req, res) => {
  try {
    const { user_id, username, role } = req.body; // optional from frontend
    if (user_id) {
      await addLoginLog(user_id, username, role, req.ip, "logout");
    }
    return res.json({ msg: "Logged out" });
  } catch (err) {
    console.error("LOGOUT ERR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

/* ──────────────────────────────
   POST /api/auth/forgot-password
──────────────────────────────── */

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  try {
    // Step 1: Check if user exists
    const [[row]] = await pool.query("SELECT role FROM users WHERE email = ?", [
      email,
    ]);

    if (!row) {
      return res
        .status(404)
        .json({ message: "No user registered with this email" });
    }

    // Step 2: Only allow superadmin reset
    if (row.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can reset password" });
    }

    // Step 3: Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, {
      otp,
      generatedAt: Date.now(),
      verified: false,
    });

    // Step 4: Send OTP via email
    await sendOTPEmail(email, otp);

    // ✅ Success response
    res.json({
      message: "OTP sent to your email address",
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (err) {
    console.error("❌ Forgot Password Error:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

/* ──────────────────────────────
   POST /api/auth/verify-otp
──────────────────────────────── */
export const verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(email);

  if (!record) return res.status(400).json({ message: "OTP not sent/expired" });
  if (Date.now() - record.generatedAt > 10 * 60 * 1000)
    return res.status(400).json({ message: "OTP expired" });
  if (otp !== record.otp)
    return res.status(400).json({ message: "Invalid OTP" });

  otpStore.set(email, { ...record, verified: true });
  res.json({ message: "OTP verified" });
};

/* ──────────────────────────────
   POST /api/auth/reset-password
──────────────────────────────── */
export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  const record = otpStore.get(email);
  if (!record?.verified)
    return res.status(400).json({ message: "OTP verification required" });

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(newPassword, salt);
  await pool.query("UPDATE users SET password=? WHERE email=?", [
    hashed,
    email,
  ]);

  otpStore.delete(email);
  res.json({ message: "Password updated" });
};

/* ──────────────────────────────
   GET /api/auth/logs
──────────────────────────────── */
export const getLoginLogs = async (_req, res) => {
  try {
    const [logs] = await pool.query(`
      SELECT id, user_id, username, role, ip_address, action, logged_in_at
      FROM login_logs
      ORDER BY logged_in_at DESC
    `);
    res.json(logs);
  } catch (err) {
    console.error("GET LOGIN LOGS ERR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
