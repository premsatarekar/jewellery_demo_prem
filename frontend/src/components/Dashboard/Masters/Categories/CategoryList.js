// src/components/Dashboard/Masters/Categories/CategoryList.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCategory } from "./CategoryContext";           // ⬅️ backend‑connected hook
import "./CategoryList.css";

const CategoryList = () => {
  const { categories, loading, deleteCategory } = useCategory(); // ⬅️ includes async delete
  const navigate = useNavigate();

  /* --------- helpers --------- */
  const handleEdit = (id) =>
    id && navigate(`/dashboard/masters/categories/edit/${id}`);

  const handleDelete = async (id) => {
    if (
      id &&
      window.confirm(
        "Are you sure you want to delete this category? This action cannot be undone."
      )
    ) {
      await deleteCategory(id);           // 🔗 hits DELETE /api/categories/:id
    }
  };

  /* -------- states ---------- */
  if (loading) return <p>Loading…</p>;
  if (!categories.length)
    return (
      <>
        <h1 className="category-heading">Categories</h1>
        <p>No categories found. Please add some categories.</p>
      </>
    );

  /* ---------- table UI (CSS unchanged) ---------- */
  return (
    <>
      <h1 className="category-heading">Categories</h1>
      <div className="table-wrapper">
        <table className="category-table" aria-label="Category List Table">
          <thead>
            <tr>
              <th scope="col">Category Name</th>
              <th scope="col" className="actions-header">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>{cat.name}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => handleEdit(cat.id)}
                      aria-label={`Edit ${cat.name} category`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => handleDelete(cat.id)}
                      aria-label={`Delete ${cat.name} category`}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CategoryList;
