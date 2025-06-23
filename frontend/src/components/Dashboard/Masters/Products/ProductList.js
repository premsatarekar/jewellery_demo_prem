// src/pages/ProductList.jsx  (or wherever you keep it)
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProductList.css";

const ProductList = ({
  products: propProducts,
  setProducts: setPropProducts,
}) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  /* ------------ fetch products ---------- */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products");
        if (!res.ok) throw new Error("API fetch failed");
        const dbRows = await res.json();

        // map DB rows → camelCase object expected by table
        const normalized = dbRows.map((r) => ({
          id: r.id, // numeric id — may be unused
          product_code: r.product_code,
          productName: r.product_name,
          category: r.category,
          karat: r.karat,
          unit: r.unit,
          weight: r.weight,
          barcode: r.barcode,
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

  /* ------------ delete ---------- */
  const handleDelete = async (code) => {
    const updated = products.filter((p) => p.product_code !== code);
    setProducts(updated);
    if (setPropProducts) setPropProducts(updated);

    /* keep localStorage sync (optional) */
    const added = updated.filter((p) => p.source !== "excel");
    const excel = updated.filter((p) => p.source === "excel");
    localStorage.setItem("addedProducts", JSON.stringify(added));
    localStorage.setItem("excelProducts", JSON.stringify(excel));

    try {
      await fetch(`http://localhost:5000/api/products/${code}`, {
        method: "DELETE",
      });
      console.log("Deleted on backend:", code);
    } catch (err) {
      console.warn("Delete failed on backend:", err);
    }
  };

  /* ------------ filter + paginate ---------- */
  const filtered = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.productName?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term) ||
      p.barcode?.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const displayed = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (n) => {
    if (n >= 1 && n <= totalPages) setCurrentPage(n);
  };

  /* ------------ render ---------- */
  return (
    <div className="product-list-container">
      <h2 className="product-list-heading">Product List</h2>

      <input
        type="text"
        className="search-bar"
        placeholder="Search by name, category or barcode"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
      />
      
    <button className="edit-btn" onClick={() => navigate("/dashboard/masters/products/add")}>
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
              <th>Barcode</th>
              <th>Source</th>
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
                <td>{p.barcode || "-"}</td>
                <td>{p.source || "backend"}</td>
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
                    onClick={() => handleDelete(p.product_code)}
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
};

export default ProductList;
