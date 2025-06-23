import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "./ProductExcel.css";

const API = "http://localhost:5000/api/products/bulk"; // 👈 NEW bulk route

export default function ProductExcel({ products, setProducts }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploadStatus, setStatus] = useState(null);

  const randomBarcode = () =>
    "BAR" + Math.floor(100000000 + Math.random() * 900000000);

  /* ------------------------------------------------------------------ */
  const handleFile = (file) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        /* 1️⃣ PARSE EXCEL ------------------------------------------------ */
        const wb = XLSX.read(e.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws); // array of objects

        if (!rows.length) {
          setStatus({ type: "error", message: "Excel file is empty." });
          return;
        }

        /* 2️⃣ NORMALISE -------------------------------------------------- */
        const payload = rows.map((row) => ({
          productName: row.name || "",
          category: row.category || "",
          karat: row.karat || "",
          weight: +row.weight || 0, // number
          unit: row.unit || "",
          stockQuantity: +row.stock_quantity || 0, // number
          price: +row.price || 0, // number
          barcode: row.barcode || randomBarcode(),
        }));

        /* 3️⃣ HIT BACKEND ------------------------------------------------ */
        setStatus({ type: "info", message: "Uploading to server…" });

        const { data } = await axios.post(API, { products: payload });

        // backend responds: { saved: [ ... ] }
        setProducts((prev) => [...prev, ...data.saved]);

        setStatus({ type: "success", message: "Excel uploaded successfully!" });
      } catch (err) {
        console.error(err);
        setStatus({
          type: "error",
          message: err.response?.data?.msg || "Upload failed.",
        });
      }
    };

    reader.onerror = () =>
      setStatus({ type: "error", message: "Error reading file." });

    reader.readAsBinaryString(file);
  };

  /* ---- drag-and-drop / choose file handlers (unchanged) -------------- */
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };
  const onChange = (e) => e.target.files[0] && handleFile(e.target.files[0]);

  /* ---- download template helper ------------------------------------- */
  const downloadTemplate = () => {
    const template = [
      [
        "name",
        "category",
        "karat",
        "weight",
        "unit",
        "stock_quantity",
        "price",
        "barcode",
      ],
      ["Gold Ring", "Jewellery", "22K", 10, "grams", 50, 45000, "BAR123456789"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Product_Template.xlsx");
  };

  /* ---- UI ------------------------------------------------------------ */
  return (
    <div className="excel-upload-container">
      <div className="excel-upload-card">
        <h2>📦 Upload Products via Excel</h2>

        <button className="download-btn" onClick={downloadTemplate}>
          ⬇️ Download Excel Template
        </button>

        <div
          className={`drop-zone ${dragOver ? "drag-over" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <p>📂 Drag & drop Excel file here</p>
          <p>or</p>
          <label className="upload-label">
            <input
              type="file"
              accept=".xlsx, .xls"
              hidden
              onChange={onChange}
            />
            <span className="upload-btn">📁 Choose File</span>
          </label>
        </div>

        {uploadStatus && (
          <p
            style={{
              marginTop: "15px",
              color:
                uploadStatus.type === "success"
                  ? "green"
                  : uploadStatus.type === "info"
                  ? "#555"
                  : "red",
              fontWeight: "bold",
            }}
          >
            {uploadStatus.message}
          </p>
        )}
      </div>
    </div>
  );
}
