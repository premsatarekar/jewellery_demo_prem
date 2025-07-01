// src/components/dashboard/InventoryTable.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const InventoryTable = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products`);
        const contentType = res.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Invalid response (HTML received):", text);
          throw new Error("Received HTML instead of JSON.");
        }

        const json = await res.json();
        setData(json);
        setFiltered(json);
      } catch (err) {
        console.error("❌ Error fetching inventory:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    const filteredData = data.filter(
      (item) =>
        item.product_name?.toLowerCase().includes(lower) ||
        item.category?.toLowerCase().includes(lower)
    );
    setFiltered(filteredData);
  }, [search, data]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Inventory Report", 14, 22);

    const headers = [["Product Name", "Category", "Stock", "Price"]];
    const rows = filtered.map((item) => [
      item.product_name,
      item.category,
      item.stock_quantity,
      item.price,
    ]);

    doc.autoTable({
      startY: 30,
      head: headers,
      body: rows,
    });

    doc.save("inventory.pdf");
  };

  const handleEdit = (productCode) => {
    navigate(`/dashboard/masters/products/edit/${productCode}`);
  };

  const handleDelete = async (productCode) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      const res = await fetch(`${API_BASE}/api/products/${productCode}`, {
        method: "DELETE",
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Invalid delete response (HTML received):", text);
        throw new Error("Delete failed: HTML received");
      }

      const json = await res.json();

      if (res.ok) {
        setData((prev) =>
          prev.filter((item) => item.product_code !== productCode)
        );
        setFiltered((prev) =>
          prev.filter((item) => item.product_code !== productCode)
        );
        alert("✅ Product deleted successfully.");
      } else {
        alert(json.message || "❌ Delete failed");
      }
    } catch (err) {
      console.error("Delete Error:", err);
      alert("❌ Error deleting product");
    }
  };

  return (
    <div style={{ marginTop: "40px" }}>
      <h3>Inventory Details</h3>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            width: "300px",
          }}
        />
        <button
          onClick={downloadPDF}
          style={{
            padding: "10px 20px",
            backgroundColor: "#1c1c4d",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
          }}
        >
          DOWNLOAD PDF
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #eee", textAlign: "left" }}>
            <th style={{ padding: "10px" }}>Product Name</th>
            <th style={{ padding: "10px" }}>Category</th>
            <th style={{ padding: "10px" }}>Stock</th>
            <th style={{ padding: "10px" }}>Price</th>
            <th style={{ padding: "10px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ padding: "10px", textAlign: "center" }}>
                No products found
              </td>
            </tr>
          ) : (
            filtered.map((item, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f5f5f5" }}>
                <td style={{ padding: "10px", fontWeight: "600" }}>
                  {item.product_name}
                </td>
                <td style={{ padding: "10px", color: "gray" }}>
                  {item.category}
                </td>
                <td style={{ padding: "10px", color: "gray" }}>
                  {item.stock_quantity}
                </td>
                <td style={{ padding: "10px", color: "gray" }}>{item.price}</td>
                <td style={{ padding: "10px" }}>
                  <span
                    style={{ cursor: "pointer", marginRight: "10px" }}
                    onClick={() => handleEdit(item.product_code)}
                  >
                    ✏️
                  </span>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDelete(item.product_code)}
                  >
                    🗑️
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
