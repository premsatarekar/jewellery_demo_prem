import db from "../config/db.js";

/* ---------- helpers ---------- */
const alpha    = /^[A-Za-z\s]+$/;
const phoneRe  = /^[0-9]{10}$/;
const gstRe    = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i;

const validate = (v) => {
  if (!alpha.test(v.name))             return "Name only letters & space";
  if (v.state && !alpha.test(v.state)) return "State only letters & space";
  if (!phoneRe.test(v.phone))          return "Phone must be 10 digits";
  if (!gstRe.test(v.gst))              return "GST number invalid";
  if (!v.address?.trim())              return "Address is required";
  return null;
};

/* ---------- ADD  POST /api/vendors/add ---------- */
export const addVendor = async (req, res) => {
  const bad = validate(req.body || {});
  if (bad) return res.status(422).json({ msg: bad });

  const { name, email = null, phone, gst, state, address } = req.body;

  try {
    const [{ insertId }] = await db.query(
      `INSERT INTO vendors
       (name,email,phone,gst,state,address)
       VALUES (?,?,?,?,?,?)`,
      [name.trim(), email, phone, gst.toUpperCase(), state.trim(), address.trim()]
    );
    res.status(201).json({ id: insertId, msg: "Vendor added" });
  } catch (err) {
    console.error("ADD VENDOR ERR:", err);
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ msg: "Phone or GST already exists" });
    res.status(500).json({ msg: "Server error" });
  }
};

/* ---------- LIST GET /api/vendors ---------- */
export const getVendors = async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM vendors ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("GET VENDOR ERR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ---------- ONE  GET /api/vendors/:id ---------- */
export const getVendorById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM vendors WHERE id=?", [
      req.params.id,
    ]);
    if (!rows.length) return res.status(404).json({ msg: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("GET BY ID ERR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ---------- UPDATE  PUT /api/vendors/:id ---------- */
export const updateVendor = async (req, res) => {
  const bad = validate(req.body || {});
  if (bad) return res.status(422).json({ msg: bad });

  const { name, email = null, phone, gst, state, address } = req.body;
  try {
    const [up] = await db.query(
      `UPDATE vendors SET
       name=?, email=?, phone=?, gst=?, state=?, address=?
       WHERE id=?`,
      [name.trim(), email, phone, gst.toUpperCase(), state.trim(), address.trim(), req.params.id]
    );
    if (!up.affectedRows) return res.status(404).json({ msg: "Not found" });
    res.json({ msg: "Vendor updated" });
  } catch (err) {
    console.error("UPDATE VENDOR ERR:", err);
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ msg: "Phone or GST already exists" });
    res.status(500).json({ msg: "Server error" });
  }
};

/* ---------- DELETE  DELETE /api/vendors/:id ---------- */
export const deleteVendor = async (req, res) => {
  try {
    const [del] = await db.query("DELETE FROM vendors WHERE id=?", [
      req.params.id,
    ]);
    if (!del.affectedRows) return res.status(404).json({ msg: "Not found" });
    res.json({ msg: "Vendor deleted" });
  } catch (err) {
    console.error("DELETE VENDOR ERR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
