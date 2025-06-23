// backend/controllers/authController.js
import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

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
  if (!username || !password || !role)
    return res.status(400).json({ message: "All fields required" });

  const [rows] = await pool.query(
    "SELECT * FROM users WHERE username=? AND role=? AND is_active=1",
    [username, role]
  );
  if (rows.length === 0)
    return res.status(401).json({ message: "Invalid credentials" });

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  // log the successful login
  await addLoginLog(user.id, user.username, user.role, req.ip, "login");

  const token = generateToken({ id: user.id, role: user.role });
  const { password: _, ...safeUser } = user; // strip hashed password
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

  const [[row]] = await pool.query("SELECT role FROM users WHERE email = ?", [
    email,
  ]);
  if (!row)
    return res
      .status(404)
      .json({ message: "No user registered with this email" });

  if (row.role !== "superadmin")
    return res.status(403).json({ message: "Only superadmin can reset here" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { otp, generatedAt: Date.now(), verified: false });

  console.log(`🔐 OTP for ${email} => ${otp}`); // dev only
  res.json({
    message: "OTP sent to email",
    otp: process.env.NODE_ENV === "development" ? otp : undefined,
  });
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
