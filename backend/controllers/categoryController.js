import db from "../config/db.js";

/* helper — validate positive numbers */
const isPositive = (v) => !isNaN(Number(v)) && Number(v) > 0;

/* ------------------------------------------------------------------ *
 *  POST  /api/categories/add   ➜  addCategory
 * ------------------------------------------------------------------ */
export const addCategory = async (req, res) => {
  const name   = (req.body?.name || "").trim().toLowerCase();
  const carats = Array.isArray(req.body?.carats) ? req.body.carats : [];

  if (!name || !carats.length) {
    return res.status(400).json({ msg: "Name & carats required" });
  }
  if (carats.some((c) => !isPositive(c.name) || !isPositive(c.price))) {
    return res.status(422).json({ msg: "Carat value & price must be positive numbers" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [{ insertId }] = await conn.query(
      "INSERT INTO categories (name) VALUES (?)",
      [name]
    );

    const rows = carats.map((c) => [insertId, Number(c.name), Number(c.price)]);
    await conn.query(
      "INSERT INTO carats (category_id, carat_value, price) VALUES ?",
      [rows]
    );

    await conn.commit();
    res.status(201).json({ id: insertId, msg: "Category added" });
  } catch (err) {
    await conn.rollback();
    console.error("ADD CATEGORY ERR:", err);
    res.status(500).json({ msg: "Server error" });
  } finally {
    conn.release();
  }
};

/* ------------------------------------------------------------------ *
 *  GET   /api/categories        ➜  getCategories (all)
 * ------------------------------------------------------------------ */
export const getCategories = async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.id   AS category_id, c.name AS category_name,
              ct.id  AS carat_id,  ct.carat_value, ct.price
       FROM categories c
       LEFT JOIN carats ct ON ct.category_id = c.id
       ORDER BY c.id, ct.carat_value`
    );

    const result = [];
    const map = new Map();
    rows.forEach((r) => {
      if (!map.has(r.category_id)) {
        map.set(r.category_id, {
          id:   r.category_id,
          name: r.category_name,
          carats: [],
        });
        result.push(map.get(r.category_id));
      }
      if (r.carat_id) {
        map.get(r.category_id).carats.push({
          id:    r.carat_id,
          name:  r.carat_value.toString(),
          price: r.price.toString(),
        });
      }
    });
    res.json(result);
  } catch (err) {
    console.error("GET CATEGORY ERR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ------------------------------------------------------------------ *
 *  GET   /api/categories/:id    ➜  getCategoryById (single)
 * ------------------------------------------------------------------ */
export const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT c.id AS category_id, c.name AS category_name,
              ct.id AS carat_id, ct.carat_value, ct.price
       FROM categories c
       LEFT JOIN carats ct ON ct.category_id = c.id
       WHERE c.id = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ msg: "Not found" });

    const category = { id: rows[0].category_id, name: rows[0].category_name, carats: [] };
    rows.forEach((r) => {
      if (r.carat_id) {
        category.carats.push({
          id:    r.carat_id,
          name:  r.carat_value.toString(),
          price: r.price.toString(),
        });
      }
    });
    res.json(category);
  } catch (err) {
    console.error("GET BY ID ERR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ------------------------------------------------------------------ *
 *  PUT   /api/categories/:id    ➜  updateCategory
 * ------------------------------------------------------------------ */
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const name   = (req.body?.name || "").trim().toLowerCase();
  const carats = Array.isArray(req.body?.carats) ? req.body.carats : [];

  if (!name || !carats.length)
    return res.status(400).json({ msg: "Name & carats required" });
  if (carats.some((c) => !isPositive(c.name) || !isPositive(c.price)))
    return res.status(422).json({ msg: "Carat value & price must be positive numbers" });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query("UPDATE categories SET name=? WHERE id=?", [name, id]);
    await conn.query("DELETE FROM carats WHERE category_id=?", [id]);

    const rows = carats.map((c) => [id, Number(c.name), Number(c.price)]);
    await conn.query(
      "INSERT INTO carats (category_id, carat_value, price) VALUES ?",
      [rows]
    );

    await conn.commit();
    res.json({ msg: "Category updated" });
  } catch (err) {
    await conn.rollback();
    console.error("UPDATE CATEGORY ERR:", err);
    res.status(500).json({ msg: "Server error" });
  } finally {
    conn.release();
  }
};

/* ------------------------------------------------------------------ *
 *  DELETE  /api/categories/:id   ➜  deleteCategory
 * ------------------------------------------------------------------ */
export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const [del] = await db.query("DELETE FROM categories WHERE id=?", [id]);
    if (!del.affectedRows)
      return res.status(404).json({ msg: "Category not found" });
    res.json({ msg: "Category deleted" });
  } catch (err) {
    console.error("DELETE CATEGORY ERR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
