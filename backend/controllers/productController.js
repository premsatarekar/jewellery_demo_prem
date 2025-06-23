// backend/controllers/productController.js
import db from "../config/db.js";

/* =========================================================================
   HELPERS
========================================================================= */
const safeStr = (val = "") => String(val ?? "").trim();
const safeNum = (val) => (isNaN(Number(val)) ? 0 : Number(val));

/* =========================================================================
   BULK ADD  ->  POST /api/products/bulk
========================================================================= */
export const bulkAddProducts = async (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products) || !products.length)
      return res.status(400).json({ msg: "products array required" });

    /* ------------ 1. Duplicate barcode inside sheet ------------- */
    const sheetBarcodes = products.map((p) => safeStr(p.barcode));
    const dupInSheet = sheetBarcodes.filter(
      (bc, idx) => sheetBarcodes.indexOf(bc) !== idx
    );
    if (dupInSheet.length)
      return res
        .status(400)
        .json({ msg: `Duplicate barcode in sheet: ${dupInSheet[0]}` });

    /* ------------ 2. Duplicate barcode vs DB -------------------- */
    const [existing] = await db.query(
      "SELECT barcode FROM products WHERE barcode IN (?)",
      [sheetBarcodes]
    );
    if (existing.length)
      return res
        .status(409)
        .json({ msg: `Barcode already exists: ${existing[0].barcode}` });

    /* ------------ 3. Current max id -> new product_code --------- */
    const [[{ maxId }]] = await db.query(
      "SELECT MAX(id) AS maxId FROM products"
    );
    let seq = maxId || 0;

    /* ------------ 4. Build VALUES array ------------------------- */
    const values = products.map((p) => {
      seq += 1;
      const product_code = `P${String(seq).padStart(3, "0")}`;

      p.product_code = product_code; // attach for response

      return [
        product_code,
        safeStr(p.productName),
        safeStr(p.category),
        safeStr(p.karat),
        safeNum(p.weight),
        safeStr(p.unit),
        safeNum(p.stockQuantity),
        safeNum(p.price),
        safeStr(p.barcode) ||
          `BAR${Math.floor(100000000 + Math.random() * 900000000)}`,
      ];
    });

    /* ------------ 5. Insert ------------------------------------- */
    const q = `INSERT INTO products
                 (product_code, product_name, category, karat, weight, unit,
                  stock_quantity, price, barcode)
               VALUES ?`;
    await db.query(q, [values]);

    /* ------------ 6. Respond ------------------------------------ */
    const saved = products.map((p) => ({ ...p, source: "excel" }));
    res.status(201).json({ saved });
  } catch (err) {
    console.error("BulkAddProducts Error:", err);
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ msg: "Duplicate barcode" });
    res.status(500).json({ msg: "DB error" });
  }
};

/* =========================================================================
   SINGLE ADD  ->  POST /api/products/add
========================================================================= */
export const addProduct = async (req, res) => {
  try {
    const {
      category,
      productName,
      karat,
      weight,
      unit,
      stockQuantity,
      price,
      barcode,
    } = req.body;

    if (
      !category ||
      !productName ||
      !karat ||
      weight === "" ||
      !unit ||
      stockQuantity === "" ||
      price === "" ||
      !barcode
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    /* next product_code */
    const [[{ maxId }]] = await db.query(
      "SELECT MAX(id) AS maxId FROM products"
    );
    const product_code = `P${String((maxId || 0) + 1).padStart(3, "0")}`;

    await db.query(
      `INSERT INTO products
         (product_code, product_name, category, karat, weight, unit,
          stock_quantity, price, barcode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product_code,
        safeStr(productName),
        safeStr(category),
        safeStr(karat),
        safeNum(weight),
        safeStr(unit),
        safeNum(stockQuantity),
        safeNum(price),
        safeStr(barcode),
      ]
    );

    res.status(201).json({ message: "Product added", product_code });
  } catch (err) {
    console.error("AddProduct Error:", err);
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ message: "Duplicate barcode" });
    res.status(500).json({ message: "DB error" });
  }
};

/* =========================================================================
   GET ALL   ->  GET /api/products
========================================================================= */
export const getProducts = async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("GetProducts Error:", err);
    res.status(500).json({ message: "DB error" });
  }
};

/* =========================================================================
   GET ONE  ->  GET /api/products/:id   (id = product_code)
========================================================================= */
export const getProductById = async (req, res) => {
  const { id } = req.params;
  const [rows] = await db.query(
    "SELECT * FROM products WHERE product_code = ?",
    [id]
  );
  if (!rows.length)
    return res.status(404).json({ message: "Product not found" });
  res.json(rows[0]);
};

/* =========================================================================
   UPDATE    ->  PUT /api/products/:id
========================================================================= */
export const updateProduct = async (req, res) => {
  const { id: product_code } = req.params;
  const { category, productName, karat, weight, unit, stockQuantity, price } =
    req.body;

  if (
    !category ||
    !productName ||
    !karat ||
    weight === "" ||
    !unit ||
    stockQuantity === "" ||
    price === ""
  ) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const [result] = await db.query(
      `UPDATE products
         SET product_name=?, category=?, karat=?, weight=?, unit=?,
             stock_quantity=?, price=?
       WHERE product_code = ?`,
      [
        safeStr(productName),
        safeStr(category),
        safeStr(karat),
        safeNum(weight),
        safeStr(unit),
        safeNum(stockQuantity),
        safeNum(price),
        product_code,
      ]
    );

    if (!result.affectedRows)
      return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product updated" });
  } catch (err) {
    console.error("UpdateProduct Error:", err);
    res.status(500).json({ message: "DB error" });
  }
};

/* =========================================================================
   DELETE    ->  DELETE /api/products/:id
========================================================================= */
export const deleteProduct = async (req, res) => {
  const { id: code } = req.params;
  try {
    const [result] = await db.query(
      "DELETE FROM products WHERE product_code = ?",
      [code]
    );

    if (!result.affectedRows)
      return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("DeleteProduct Error:", err);
    res.status(500).json({ message: "DB error" });
  }
};
