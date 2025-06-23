import db from "../config/db.js";

/* ---------- Helper ---------- */
const formatDate = (d) => new Date(d).toISOString().slice(0, 10);

/* ---------- Add new sale ---------- */
export const addSale = async (req, res) => {
  const {
    invoice_no,
    customer_name,
    invoice_date,
    payment_mode,
    cheque_no,
    state,
    amount_paid,
    tax_percent,
    discount_percent,
    cgst,
    sgst,
    igst,
    sub_total,
    total,
    items, // ← array
  } = req.body;

  if (!invoice_no || !customer_name || !invoice_date || !payment_mode || !state || !items?.length)
    return res.status(400).json({ msg: "Required fields missing" });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    /* 1. insert into sales_orders */
    const [result] = await conn.query(
      `INSERT INTO sales_orders
       (invoice_no, customer_name, invoice_date, payment_mode, cheque_no, state,
        amount_paid, tax_percent, discount_percent, cgst, sgst, igst, sub_total, total)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        invoice_no,
        customer_name,
        formatDate(invoice_date),
        payment_mode,
        cheque_no || null,
        state,
        amount_paid,
        tax_percent,
        discount_percent || 0,
        cgst,
        sgst,
        igst,
        sub_total,
        total,
      ]
    );
    const orderId = result.insertId;

    /* 2. bulk insert items */
    const itemValues = items.map((it) => [
      orderId,
      it.itemName,
      it.weight || null,
      it.quantity,
      it.cost,
      it.makingCharges || 0,
      it.amount,
      it.barcode || null,
    ]);
    await conn.query(
      `INSERT INTO sales_items
       (order_id, item_name, weight, quantity, cost, making_pct, amount, barcode)
       VALUES ?`,
      [itemValues]
    );

    await conn.commit();
    res.status(201).json({ msg: "Sale saved", id: orderId });
  } catch (err) {
    await conn.rollback();
    console.error("ADD SALE ERR:", err);
    res.status(500).json({ msg: "Server error" });
  } finally {
    conn.release();
  }
};

/* ---------- List all orders ---------- */
export const listSales = async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, invoice_no, customer_name, invoice_date, payment_mode,
              state, total
       FROM sales_orders
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("LIST SALES ERR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ---------- Get single order (with items) ---------- */
export const getSale = async (req, res) => {
  const { invoiceNo } = req.params;
  try {
    const [[order]] = await db.query(`SELECT * FROM sales_orders WHERE invoice_no=?`, [invoiceNo]);
    if (!order) return res.status(404).json({ msg: "Not found" });

    const [items] = await db.query(`SELECT * FROM sales_items WHERE order_id=?`, [order.id]);
    order.items = items;
    res.json(order);
  } catch (err) {
    console.error("GET SALE ERR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ---------- Update order ---------- */
export const updateSale = async (req, res) => {
  const { invoiceNo } = req.params;
  const { order, items } = req.body; // expect merged structure from client

  const conn = await db.getConnection();
  try {
    /* 1. get id */
    const [[existing]] = await conn.query(`SELECT id FROM sales_orders WHERE invoice_no=?`, [invoiceNo]);
    if (!existing) return res.status(404).json({ msg: "Not found" });
    const orderId = existing.id;

    await conn.beginTransaction();

    /* 2. update master */
    await conn.query(
      `UPDATE sales_orders SET customer_name=?, invoice_date=?, payment_mode=?, cheque_no=?, state=?,
        amount_paid=?, tax_percent=?, discount_percent=?, cgst=?, sgst=?, igst=?, sub_total=?, total=?
       WHERE id=?`,
      [
        order.customer_name,
        formatDate(order.invoice_date),
        order.payment_mode,
        order.cheque_no || null,
        order.state,
        order.amount_paid,
        order.tax_percent,
        order.discount_percent || 0,
        order.cgst,
        order.sgst,
        order.igst,
        order.sub_total,
        order.total,
        orderId,
      ]
    );

    /* 3. delete old items & insert new */
    await conn.query(`DELETE FROM sales_items WHERE order_id=?`, [orderId]);

    const vals = items.map((it) => [
      orderId,
      it.itemName,
      it.weight || null,
      it.quantity,
      it.cost,
      it.makingCharges || 0,
      it.amount,
      it.barcode || null,
    ]);
    await conn.query(
      `INSERT INTO sales_items
       (order_id, item_name, weight, quantity, cost, making_pct, amount, barcode)
       VALUES ?`,
      [vals]
    );

    await conn.commit();
    res.json({ msg: "Sale updated" });
  } catch (err) {
    await conn.rollback();
    console.error("UPDATE SALE ERR:", err);
    res.status(500).json({ msg: "Server error" });
  } finally {
    conn.release();
  }
};

/* ---------- Delete order ---------- */
export const deleteSale = async (req, res) => {
  const { invoiceNo } = req.params;
  try {
    const [del] = await db.query(`DELETE FROM sales_orders WHERE invoice_no=?`, [invoiceNo]);
    if (!del.affectedRows) return res.status(404).json({ msg: "Not found" });
    res.json({ msg: "Sale deleted" });
  } catch (err) {
    console.error("DELETE SALE ERR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ---------- Sales report ---------- */
export const salesReport = async (req, res) => {
  const { start_date, end_date, customer_name, report_type } = req.query;

  let conds = [];
  let params = [];

  if (start_date) {
    conds.push("invoice_date >= ?");
    params.push(start_date);
  }
  if (end_date) {
    conds.push("invoice_date <= ?");
    params.push(end_date);
  }
  if (customer_name) {
    conds.push("customer_name LIKE ?");
    params.push(`%${customer_name}%`);
  }

  const whereClause = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

  try {
    const [rows] = await db.query(
      `SELECT invoice_date, customer_name, total FROM sales_orders ${whereClause}`,
      params
    );
    res.json(rows); // frontend already groups by period
  } catch (err) {
    console.error("SALES REPORT ERR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
