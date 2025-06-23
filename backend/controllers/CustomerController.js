// backend/controllers/customerController.js
import db from "../config/db.js";

/* ---------- validation helpers ---------- */
const alpha = /^[A-Za-z\s]+$/;
const mobileRe = /^[0-9]{10}$/;
const pinRe    = /^[0-9]{6}$/;
const aadharRe = /^[0-9]{12}$/;

const isValidCustomer = (c) => {
  if (!alpha.test(c.firstName) || !alpha.test(c.lastName)) return "Invalid name";
  if (c.middleName && !alpha.test(c.middleName))           return "Middle name invalid";
  if (!mobileRe.test(c.mobile))                            return "Mobile must be 10 digits";
  if (!aadharRe.test(c.aadhar))                            return "Aadhar must be 12 digits";
  if (!alpha.test(c.city))                                 return "City invalid";
  if (!pinRe.test(c.pin))                                  return "Pin must be 6 digits";
  if (c.referenceName && !alpha.test(c.referenceName))     return "Reference name invalid";
  if (!c.address.trim())                                   return "Address is required";
  return null;
};

/* ---------- ADD (POST /api/customer/add) ---------- */
export const addCustomer = async (req, res) => {
  const errMsg = isValidCustomer(req.body || {});
  if (errMsg) return res.status(422).json({ msg: errMsg });

  const {
    firstName, middleName, lastName,
    mobile, email = null, aadhar,
    city, pin, referenceName = null,
    referenceNo = null, address,
  } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO customers
       (first_name,middle_name,last_name,mobile,email,aadhar,city,pin_code,
        reference_name,reference_no,address)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        firstName, middleName, lastName, mobile, email, aadhar,
        city, pin, referenceName, referenceNo, address,
      ]
    );
    res.status(201).json({ id: result.insertId, msg: "Customer added" });
  } catch (err) {
    console.error("ADD CUSTOMER ERR:", err);
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ msg: "Mobile or Aadhar already exists" });
    res.status(500).json({ msg: "Server error" });
  }
};

/* ---------- LIST (GET /api/customer) ---------- */
export const getAllCustomers = async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM customers ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("GET CUSTOMER ERR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ---------- SINGLE (GET /api/customer/:id) ---------- */
export const getCustomerById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM customers WHERE id=?", [id]);
    if (!rows.length) return res.status(404).json({ msg: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("GET BY ID ERR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ---------- UPDATE (PUT /api/customer/:id) ---------- */
export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const errMsg = isValidCustomer(req.body || {});
  if (errMsg) return res.status(422).json({ msg: errMsg });

  const {
    firstName, middleName, lastName,
    mobile, email = null, aadhar,
    city, pin, referenceName = null,
    referenceNo = null, address,
  } = req.body;

  try {
    const [up] = await db.query(
      `UPDATE customers SET
        first_name=?, middle_name=?, last_name=?, mobile=?, email=?, aadhar=?,
        city=?, pin_code=?, reference_name=?, reference_no=?, address=?
       WHERE id=?`,
      [
        firstName, middleName, lastName, mobile, email, aadhar,
        city, pin, referenceName, referenceNo, address, id,
      ]
    );
    if (!up.affectedRows) return res.status(404).json({ msg: "Not found" });
    res.json({ msg: "Customer updated" });
  } catch (err) {
    console.error("UPDATE CUSTOMER ERR:", err);
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ msg: "Mobile or Aadhar already exists" });
    res.status(500).json({ msg: "Server error" });
  }
};

/* ---------- DELETE (DELETE /api/customer/:id) ---------- */
export const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const [del] = await db.query("DELETE FROM customers WHERE id=?", [id]);
    if (!del.affectedRows) return res.status(404).json({ msg: "Not found" });
    res.json({ msg: "Customer deleted" });
  } catch (err) {
    console.error("DELETE CUSTOMER ERR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
