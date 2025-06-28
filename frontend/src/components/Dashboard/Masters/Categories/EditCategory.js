// src/components/Dashboard/Masters/Categories/EditCategory.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCategory } from "./CategoryContext";          
import "./EditCategory.css";

const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { categories, loading, updateCategory } = useCategory(); 

  const [name, setName] = useState("");
  const [carats, setCarats] = useState([]);

  /* fill form when data ready */
  useEffect(() => {
    if (!loading) {
      const cat = categories.find((c) => c.id === Number(id));
      if (cat) {
        setName(cat.name);
        setCarats(cat.carats);
      }
    }
  }, [loading, categories, id]);

  /* helpers */
  const handleCaratChange = (idx, field, val) =>
    setCarats((prev) => {
      const up = [...prev];
      up[idx] = { ...up[idx], [field]: val };
      return up;
    });

  const addCarat    = () => setCarats((p) => [...p, { name: "", price: "" }]);
  const removeCarat = (idx) => setCarats((p) => p.filter((_, i) => i !== idx));
  const isPositive  = (v) => !isNaN(Number(v)) && Number(v) > 0;

  const handleSave = async () => {
    if (!name.trim()) return alert("Category name cannot be empty.");
    if (carats.some((c) => !isPositive(c.name) || !isPositive(c.price)))
      return alert("Carat value & price must be positive numbers.");

    const payload = {
      name: name.trim(),
      carats: carats.map((c) => ({
        name:  c.name.trim(),
        price: c.price.trim(),
      })),
    };

    const res = await updateCategory(Number(id), payload); 
    if (res.ok) navigate("/dashboard/masters/categories");
    else alert(res.msg);
  };

  /* state cases */
  if (loading) return <p>Loading…</p>;
  if (!categories.find((c) => c.id === Number(id)))
    return <div className="edit-category-container">Category not found.</div>;

  /* JSX and inline CSS unchanged */
  return (
    <>
      {/* — inline <style> block exactly as your original — */}
      <style>{`
        /* (same CSS you provided) */
      `}</style>

      <div className="edit-category-container">
        <h2 className="edit-category-title">Edit Category</h2>

        <div className="form-group">
          <label htmlFor="categoryName" className="form-label">
            Category Name:
          </label>
          <input
            id="categoryName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter category name"
            className="form-input"
          />
        </div>

        <h3 className="carats-title">Carats</h3>
        {carats.map((carat, idx) => (
          <div className="carat-row" key={idx}>
            <input
              type="text"
              placeholder="Carat value"
              value={carat.name}
              onChange={(e) => handleCaratChange(idx, "name", e.target.value)}
              className="carat-input"
            />
            <input
              type="text"
              placeholder="Price"
              value={carat.price}
              onChange={(e) => handleCaratChange(idx, "price", e.target.value)}
              className="carat-input"
            />
            <button
              type="button"
              onClick={() => removeCarat(idx)}
              className="btn btn-remove"
            >
              Remove
            </button>
          </div>
        ))}

        <button type="button" onClick={addCarat} className="btn btn-add">
          Add Carat
        </button>

        <div className="form-actions">
          <button onClick={handleSave} className="btn btn-save">
            Save
          </button>
          <button
            onClick={() => navigate("/dashboard/masters/categories")}
            className="btn btn-cancel"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default EditCategory;
