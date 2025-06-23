import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useCategory } from "./CategoryContext";   // <-- context hook
import "react-toastify/dist/ReactToastify.css";
import "./AddCategory.css";

const AddCategory = () => {
  const navigate = useNavigate();
  const { fetchCategories } = useCategory();       // <-- list refresh helper

  const [categoryName, setCategoryName] = useState("");
  const [carats, setCarats] = useState([{ name: "", price: "" }]);
  const [errors, setErrors] = useState({ category: false, carats: [] });

  /* -------------- helpers ---------------- */
  const alphaRegex  = /^[A-Za-z\s]+$/;
  const isPositive  = (v) => !isNaN(Number(v)) && Number(v) > 0;

  const handleCaratChange = (idx, field, val) => {
    setCarats((prev) => {
      const up = [...prev];
      up[idx][field] = val;
      setErrors((e) => {
        const ce = [...e.carats];
        ce[idx] = !isPositive(val.trim());
        return { ...e, carats: ce };
      });
      return up;
    });
  };

  const addCaratField    = () => setCarats((p) => [...p, { name: "", price: "" }]);
  const removeCaratField = (idx) => setCarats((p) => p.filter((_, i) => i !== idx));

  /* -------------- submit ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    /* front‑end validation */
    let ok = true;
    const newErr = { category: false, carats: [] };

    if (!categoryName.trim() || !alphaRegex.test(categoryName.trim())) {
      newErr.category = true;
      ok = false;
    }
    carats.forEach((c, i) => {
      const valid = isPositive(c.name.trim()) && isPositive(c.price.trim());
      newErr.carats[i] = !valid;
      if (!valid) ok = false;
    });
    setErrors(newErr);
    if (!ok) return toast.error("Please fill all required fields correctly.");

    /* backend payload */
    const payload = {
      name: categoryName.trim().toLowerCase(),
      carats: carats.map((c) => ({
        name:  c.name.trim(),
        price: c.price.trim(),
      })),
    };

    try {
      await axios.post("/api/categories/add", payload); // backend call
      await fetchCategories();                          // ⬅️ refresh list
      toast.success("✅ Category saved!", { autoClose: 2000 });

      setCategoryName("");
      setCarats([{ name: "", price: "" }]);
      setTimeout(() => navigate("/dashboard/masters/categories"), 1500);
    } catch (err) {
      if (err.response?.status === 409) {
        toast.warning("⚠️ Category already exists.");
      } else if (err.response?.data?.msg) {
        toast.error(err.response.data.msg);
      } else {
        toast.error("🚨 Server error.");
      }
      console.error(err);
    }
  };

  /* -------------- JSX (unchanged styling) -------------- */
  return (
    <div className="add-category-container">
      <div className="add-category-card">
        <div className="card-header">
          <h2>➕ Add New Category</h2>
          <button
            className="view-category-btn"
            type="button"
            onClick={() => navigate("/dashboard/masters/categories")}
          >
            📄 View Category
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Category name */}
          <div className="form-group">
            <input
              type="text"
              placeholder="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className={errors.category ? "invalid" : ""}
              aria-invalid={errors.category}
              required
            />
            {errors.category && (
              <div className="error-message" role="alert">
                Category name is required and should contain only alphabets and spaces.
              </div>
            )}
          </div>

          {/* Carat rows */}
          {carats.map((carat, idx) => (
            <div className="carat-row" key={idx}>
              <div className="form-group">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Carat"
                  value={carat.name}
                  onChange={(e) => handleCaratChange(idx, "name", e.target.value)}
                  className={errors.carats[idx] ? "invalid" : ""}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Price"
                  value={carat.price}
                  onChange={(e) => handleCaratChange(idx, "price", e.target.value)}
                  className={errors.carats[idx] ? "invalid" : ""}
                  required
                />
              </div>
              {carats.length > 1 && (
                <button
                  type="button"
                  className="remove-carat-btn"
                  onClick={() => removeCaratField(idx)}
                >
                  ➖
                </button>
              )}
              {errors.carats[idx] && (
                <div className="error-message" role="alert">
                  Carat and price must be positive numbers.
                </div>
              )}
            </div>
          ))}

          {/* Buttons */}
          <div className="button-container">
            <button type="button" className="add-carat-btn" onClick={addCaratField}>
              ➕ Add Carat
            </button>
            <button type="submit" className="save-category-btn">
              ✅ Save Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategory;
