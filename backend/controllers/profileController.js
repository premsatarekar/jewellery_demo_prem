// backend/controllers/profileController.js
import db from "../config/db.js";

// ─────────────────────────────────────────────
//  GET  /api/profile  – super-admin profile
// ─────────────────────────────────────────────
export const getProfile = async (_req, res) => {
  try {
    const [[row]] = await db.query("SELECT * FROM admin_profile WHERE id = 1");
    if (!row) return res.status(404).json({ msg: "Profile not found" });
    res.json(row);
  } catch (err) {
    console.error("GET PROFILE ERR:", err);
    res.status(500).json({ msg: err.message || "Server error" });
  }
};

// ─────────────────────────────────────────────
//  PUT  /api/profile  – create OR update
// ─────────────────────────────────────────────
export const saveProfile = async (req, res) => {
  const {
    name = "",
    email = "",
    image_url = "",
    shop_name = "",
    shop_address = "",
    mobile = "",
    gst_number = "",
  } = req.body;

  // 1️⃣ basic validation
  if (!name.trim() || !email.trim())
    return res.status(400).json({ msg: "Name & email required" });

  try {
    /* 2️⃣ make sure id=1 row exists
          IGNORE ⇒ duplicate error nahi aayega              */
    await db.query(
      `INSERT IGNORE INTO admin_profile (id, name, email)
       VALUES (1, ?, ?)`,
      [name, email]
    );

    /* 3️⃣ normal UPDATE */
    await db.query(
      `UPDATE admin_profile SET
         name = ?,      email = ?,     image_url = ?,
         shop_name = ?, shop_address = ?, mobile = ?, gst_number = ?
       WHERE id = 1`,
      [name, email, image_url, shop_name, shop_address, mobile, gst_number]
    );

    res.json({ msg: "Profile saved Successfully ✅" });
  } catch (err) {
    console.error("SAVE PROFILE ERR:", err);
    res.status(500).json({ msg: err.message || "Server error" });
  }
};
