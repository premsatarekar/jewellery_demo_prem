import React, { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function BarcodeList() {
  const [files, setFiles] = useState([]);

  // ✅ Step: Load all PDFs from backend
  useEffect(() => {
    const fetchPDFs = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products/barcode-pdf/list`);
        const data = await res.json();
        setFiles(data);
      } catch (err) {
        console.error("Failed to fetch PDF list:", err);
      }
    };
    fetchPDFs();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>📄 Barcode PDF Files</h2>
      <ul>
        {files.map((file, idx) => (
          <li key={idx}>
            {/* 👉 View PDF */}
            <a
              href={`${API_BASE}/barcodes/${file}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginRight: "10px" }}
            >
              {file}
            </a>

            {/* 👉 Download PDF */}
            <a
              href={`${API_BASE}/barcodes/${file}`}
              download
              style={{ color: "blue", fontSize: "14px" }}
            >
              ⬇ Download
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
