import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProductList.css";
import BarcodeGenerator from "./BarcodeGenerator";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const ROWS_PER_PAGE = 20;

export default function ProductList({
  products: propProducts,
  setProducts: setPropProducts,
}) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  /* -------------------------------------------------
     FETCH products from backend first, fallback localStorage
  ------------------------------------------------- */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products`);
        if (!res.ok) throw new Error("API fetch failed");
        const dbRows = await res.json();

        /* map snake_case -> camelCase expected by table */
        const normalized = dbRows.map((r) => ({
          id: r.id,
          product_code: r.product_code,
          productName: r.product_name,
          category: r.category,
          karat: r.karat,
          unit: r.unit,
          weight: r.weight,
          hsn: r.hsn,
          barcode: r.barcode,
          barcode_image: r.barcode_image,
          stockQuantity: r.stock_quantity,
          price: r.price,
          source: "backend",
        }));

        setProducts(normalized);
        if (setPropProducts) setPropProducts(normalized);
      } catch (err) {
        console.error("API failed. Falling back to localStorage:", err);
        let localProducts = [];
        try {
          const added = JSON.parse(localStorage.getItem("addedProducts")) || [];
          const excel = JSON.parse(localStorage.getItem("excelProducts")) || [];
          localProducts = [...added, ...excel];
        } catch (e) {
          console.error("Failed to load from localStorage", e);
        }
        setProducts(localProducts);
        if (setPropProducts) setPropProducts(localProducts);
      }
    };
    fetchProducts();
  }, [setPropProducts, propProducts]);

  /* -------------------------------------------------
     DELETE handler
  ------------------------------------------------- */
  const handleDelete = async (code) => {
    const updated = products.filter((p) => p.product_code !== code);
    setProducts(updated);
    if (setPropProducts) setPropProducts(updated);

    /* sync localStorage if you still use it */
    const added = updated.filter((p) => p.source !== "excel");
    const excel = updated.filter((p) => p.source === "excel");
    localStorage.setItem("addedProducts", JSON.stringify(added));
    localStorage.setItem("excelProducts", JSON.stringify(excel));

    try {
      await fetch(`${API_BASE}/api/products/${code}`, {
        method: "DELETE",
      });

      console.log("Deleted on backend:", code);
    } catch (err) {
      console.warn("Delete failed on backend:", err);
    }
  };

  /* -------------------------------------------------
     SEARCH + PAGINATION
  ------------------------------------------------- */
  const filtered = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.productName?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term) ||
      p.barcode?.toLowerCase().includes(term) ||
      p.hsn?.toLowerCase().includes(term) // 👈 NEW
    );
  });

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE) || 1;
  const displayed = filtered.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const handlePageChange = (n) =>
    n >= 1 && n <= totalPages && setCurrentPage(n);

  /* -------------------------------------------------
     RENDER
  ------------------------------------------------- */
  return (
    <div className="product-list-container">
      <h2 className="product-list-heading">Product List</h2>

      <input
        type="text"
        className="search-bar"
        placeholder="Search by name, category, barcode or HSN"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
      />

      <button
        className="edit-btn"
        onClick={() => navigate("/dashboard/masters/products/add")}
      >
        Add Product
      </button>
      <br />
      <br />

      <div className="table-wrapper">
        <table className="product-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Category</th>
              <th>Karat</th>
              <th>Unit</th>
              <th>Weight</th>
              <th>HSN</th>
              <th>Barcode</th>
              <th>Barcode Image</th>
              {/* <th>Source</th> */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((p, idx) => (
              <tr key={p.product_code || idx}>
                <td>{p.product_code || "-"}</td>
                <td>{p.productName || "-"}</td>
                <td>{p.category || "-"}</td>
                <td>{p.karat || "-"}</td>
                <td>{p.unit || "-"}</td>
                <td>{p.weight || "-"}</td>
                <td>{p.hsn || "-"}</td>
                <td>{p.barcode || "-"}</td>
                <td>
                  {p.barcode ? (
                    <div style={{ textAlign: "center" }}>
                      <BarcodeGenerator
                        value={p.barcode}
                        productName={p.productName}
                        price={p.price}
                        hideInfo={true}
                        compact={true}
                        showButtons={true} // 👈 this will show "Print" & "Download"
                      />
                    </div>
                  ) : (
                    "-"
                  )}
                </td>

                {/* <td>{p.source || "backend"}</td> */}
                <td>
                  <button
                    className="edit-btn"
                    onClick={() =>
                      navigate(
                        `/dashboard/masters/products/edit/${p.product_code}`
                      )
                    }
                    disabled={!p.product_code}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this product?"
                        )
                      ) {
                        handleDelete(p.product_code);
                      }
                    }}
                    disabled={!p.product_code}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ◀
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={currentPage === i + 1 ? "active" : ""}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
}
