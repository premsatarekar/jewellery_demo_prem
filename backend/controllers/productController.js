import db from "../config/db.js";
import { addBarcodeToPdf } from "../utils/pdfBuilder.js";
import { generateBarcodeBuffer } from "../utils/generateBarcodeBuffer.js";
import { generateBulkBarcodePDF } from "../utils/pdfBuilder.js";


/* ---------------- helpers ---------------- */
const safeStr = (v = "") => String(v ?? "").trim();
const safeNum = (v) => (isNaN(Number(v)) ? 0 : Number(v));
const HSN_REGEX = /^[A-Za-z0-9]{1,13}$/;

/* =========================================================
   ADD ONE  ->  POST /api/products/add
========================================================= */
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
      hsn,
      barcodeImageBase64,
    } = req.body;

    if (
      !category ||
      !productName ||
      !karat ||
      weight === "" ||
      !unit ||
      stockQuantity === "" ||
      price === "" ||
      !barcode ||
      !hsn ||
      !barcodeImageBase64
    )
      return res.status(400).json({ message: "All fields are required" });

    if (!HSN_REGEX.test(hsn))
      return res.status(400).json({ message: "HSN must be 1-13 A-Z / 0-9" });

    const [[dup]] = await db.query(
      "SELECT barcode, hsn FROM products WHERE barcode = ? OR hsn = ?",
      [barcode, hsn]
    );
    if (dup?.barcode === barcode)
      return res.status(409).json({ message: "Duplicate barcode" });
    if (dup?.hsn === hsn)
      return res.status(409).json({ message: "Duplicate HSN number" });

    // Convert base64 to Buffer
    const base64Data = barcodeImageBase64.replace(
      /^data:image\/\w+;base64,/,
      ""
    );
    const barcodeBuffer = Buffer.from(base64Data, "base64");

    // Create product code
    const [[{ maxId }]] = await db.query(
      "SELECT MAX(id) AS maxId FROM products"
    );
    const product_code = `P${String((maxId || 0) + 1).padStart(3, "0")}`;

    // Generate and save barcode PDF
    const dateTimeString = new Date().toLocaleString("en-IN", {
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
    await addBarcodeToPdf(barcodeBuffer, dateTimeString, "single", barcode);

    const barcode_image = null; // You can use local file path if needed

    await db.query(
      `INSERT INTO products
         (product_code, product_name, category, karat, weight, unit,
          stock_quantity, price, barcode, hsn, barcode_image)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
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
        safeStr(hsn),
        barcode_image,
      ]
    );

    res.status(201).json({ message: "Product added", product_code });
  } catch (err) {
    console.error("AddProduct Error:", err);
    res.status(500).json({ message: "DB error" });
  }
};

/* =========================================================
   BULK ADD  ->  POST /api/products/bulk
========================================================= */
export const bulkAddProducts = async (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products) || !products.length)
      return res.status(400).json({ msg: "products array required" });

    const sheetBar = products.map((p) => safeStr(p.barcode));
    const sheetHsn = products.map((p) => safeStr(p.hsn));
    const dupBar = sheetBar.find((b, i) => sheetBar.indexOf(b) !== i);
    const dupHsn = sheetHsn.find((h, i) => sheetHsn.indexOf(h) !== i);
    if (dupBar)
      return res.status(400).json({ msg: `Dup barcode in sheet: ${dupBar}` });
    if (dupHsn)
      return res.status(400).json({ msg: `Dup HSN in sheet: ${dupHsn}` });

    const bad = products.find((p) => !HSN_REGEX.test(safeStr(p.hsn)));
    if (bad) return res.status(400).json({ msg: `Invalid HSN: ${bad.hsn}` });

    const [exist] = await db.query(
      "SELECT barcode, hsn FROM products WHERE barcode IN (?) OR hsn IN (?)",
      [sheetBar, sheetHsn]
    );
    if (exist.length)
      return res
        .status(409)
        .json({ msg: `Duplicate in DB: ${exist[0].barcode || exist[0].hsn}` });

    const [[{ maxId }]] = await db.query(
      "SELECT MAX(id) AS maxId FROM products"
    );
    let seq = maxId || 0;

    const values = products.map((p) => {
      seq += 1;
      const code = `P${String(seq).padStart(3, "0")}`;
      p.product_code = code;
      return [
        code,
        safeStr(p.productName),
        safeStr(p.category),
        safeStr(p.karat),
        safeNum(p.weight),
        safeStr(p.unit),
        safeNum(p.stockQuantity),
        safeNum(p.price),
        safeStr(p.barcode),
        safeStr(p.hsn),
      ];
    });

    await db.query(
      `INSERT INTO products
        (product_code, product_name, category, karat, weight, unit,
         stock_quantity, price, barcode, hsn)
       VALUES ?`,
      [values]
    );
    await generateBulkBarcodePDF(products);

    res
      .status(201)
      .json({ saved: products.map((p) => ({ ...p, source: "excel" })) });
  } catch (err) {
    console.error("BulkAddProducts Error:", err);
    res.status(500).json({ msg: "DB error" });
  }
};

/* ===================== REMAINING CRUD ===================== */

export const getProductByHSN = async (req, res) => {
  const { hsn } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM products WHERE hsn = ?", [
      hsn,
    ]);
    if (!rows.length) return res.status(404).json({ message: "HSN not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("GetProductByHSN Error:", err);
    res.status(500).json({ message: "DB error" });
  }
};

export const getProducts = async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("GetProducts Error:", err);
    res.status(500).json({ message: "DB error" });
  }
};

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

export const getProductByBarcode = async (req, res) => {
  const { barcode } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM products WHERE barcode = ?", [
      barcode,
    ]);
    if (!rows.length)
      return res.status(404).json({ message: "Barcode not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("GetProductByBarcode Error:", err);
    res.status(500).json({ message: "DB error" });
  }
};

export const getBarcodePdf = async (req, res) => {
  const { barcode } = req.params;
  try {
    const buffer = await generateBarcodeBuffer(barcode);
    const dateTime = new Date().toLocaleString("en-IN", {
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
    await addBarcodeToPdf(buffer, dateTime, "single");

    res.json({ message: "Barcode PDF generated" });
  } catch (err) {
    console.error("Barcode PDF generation error:", err);
    res.status(500).json({ message: "Failed to generate barcode PDF" });
  }
};
