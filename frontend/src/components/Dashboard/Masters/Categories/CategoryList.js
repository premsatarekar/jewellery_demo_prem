import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCategory } from "./CategoryContext";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./CategoryList.css";

const CategoryList = () => {
  const { categories, loading, deleteCategory } = useCategory();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const handleEdit = (id) =>
    id && navigate(`/dashboard/masters/categories/edit/${id}`);
  const handleDelete = async (id) => {
    if (
      id &&
      window.confirm(
        "Are you sure you want to delete this category? This action cannot be undone."
      )
    ) {
      await deleteCategory(id);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Category List", 14, 10);
    doc.autoTable({
      head: [["SR No.", "Category Name"]],
      body: filteredCategories.map((cat, index) => [index + 1, cat.name]),
    });
    doc.save("categories.pdf");
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / perPage);
  const paginatedData = filteredCategories.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  if (loading) return <p className="loading">Loading…</p>;

  return (
    <div className="category-card-container">
      <div className="category-card">
        <div className="category-card-header">
          <h2 className="category-title">Category List</h2>
          <div className="category-actions">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="category-search"
            />
            <button
              className="add-btn"
              onClick={() => navigate("/dashboard/masters/categories/add")}
            >
              + Add Category
            </button>
            <button onClick={exportPDF} className="pdf-btn">
              Export PDF
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="category-table">
            <thead>
              <tr>
                <th>SR No.</th>
                <th>Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((cat, index) => (
                  <tr key={cat.id}>
                    <td>{(currentPage - 1) * perPage + index + 1}</td>
                    <td>{cat.name}</td>
                    <td>
                      <div className="action-icons">
                        <span
                          onClick={() => handleEdit(cat.id)}
                          className="material-icon edit-icon"
                        >
                          ✏️
                        </span>
                        <span
                          onClick={() => handleDelete(cat.id)}
                          className="material-icon delete-icon"
                        >
                          🗑️
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-data">
                    No matching categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-controls">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="pagination-btn"
          >
            ⬅ Previous
          </button>
          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="pagination-btn"
          >
            Next ➡
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryList;
