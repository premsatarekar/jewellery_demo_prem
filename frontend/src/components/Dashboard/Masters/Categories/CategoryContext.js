// src/components/Dashboard/Masters/Categories/CategoryContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

/* ---------------- Context helpers ---------------- */
export const CategoryContext = createContext();
export const useCategory = () => useContext(CategoryContext);

/* ---------------- Provider ---------------- */
export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  /* 🔹 1. reusable fetch – backend se list laa ke state bhar do */
  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories");
      const data = Array.isArray(response.data) ? response.data : [];

      console.log("✅ Safe Fetched data:", data);

      const safeData = data.map((cat) => ({
        ...cat,
        carats: Array.isArray(cat.carats) ? cat.carats : [],
      }));

      setCategories(safeData);
    } catch (err) {
      console.error("❌ Fetch categories failed:", err);
      setCategories([]); // fallback in case of error
    } finally {
      setLoading(false);
    }
  };

  /* component mount pe ek hi dafa call */
  useEffect(() => {
    fetchCategories();
  }, []);

  /* 🔹 2. add category */
  const addCategory = async (payload) => {
    try {
      await axios.post("/api/categories/add", payload);
      await fetchCategories(); // list refresh
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        msg: err?.response?.data?.msg || "Server error",
        code: err?.response?.status,
      };
    }
  };

  /* 🔹 3. update poori category (name, carats sab) */
  const updateCategory = async (id, payload) => {
    try {
      await axios.put(`/api/categories/${id}`, payload);
      await fetchCategories(); // list refresh
      return { ok: true };
    } catch (err) {
      return { ok: false, msg: err?.response?.data?.msg || "Server error" };
    }
  };

  /* 🔹 4. **Sirf prices** update karne wala util – AdminDashboard me lagta hai */
  const updateCategoryPrices = async (id, updatedCatObj) => {
    try {
      // backend ko PUT
      await axios.put(`/api/categories/${id}`, updatedCatObj);

      // optimistically local state bhi turant badal de
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? updatedCatObj : cat))
      );
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        msg: err?.response?.data?.msg || "Server error",
      };
    }
  };

  /* 🔹 5. delete category */
  const deleteCategory = async (id) => {
    try {
      await axios.delete(`/api/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- Provider value ---------------- */
  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        fetchCategories,
        addCategory,
        updateCategory,
        updateCategoryPrices, // ✅ yahi function AdminDashboard use karega
        deleteCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};
