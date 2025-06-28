// src/components/Dashboard/Masters/Categories/CategoryContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axios from "axios";

/* ---------------- Context helpers ---------------- */
export const CategoryContext = createContext();
export const useCategory = () => useContext(CategoryContext);

/* ---------------- Provider ---------------- */
export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  /* 🔹 1. Fetch all categories */
  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/categories`);
      const safeData = Array.isArray(data)
        ? data.map((cat) => ({
            ...cat,
            carats: Array.isArray(cat.carats) ? cat.carats : [],
          }))
        : [];

      setCategories(safeData);
    } catch (err) {
      console.error("❌ Fetch categories failed:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  /* 🔹 2. Add category */
  const addCategory = async (payload) => {
    try {
      await axios.post(`${API_BASE}/api/categories/add`, payload);
      await fetchCategories();
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        msg: err?.response?.data?.msg || "Server error",
        code: err?.response?.status,
      };
    }
  };

  /* 🔹 3. Update full category (name & carats) */
  const updateCategory = async (id, payload) => {
    try {
      await axios.put(`${API_BASE}/api/categories/${id}`, payload);
      await fetchCategories();
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        msg: err?.response?.data?.msg || "Server error",
      };
    }
  };

  /* 🔹 4. Update only prices */
  const updateCategoryPrices = async (id, updatedCatObj) => {
    try {
      await axios.put(`${API_BASE}/api/categories/${id}`, updatedCatObj);
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

  /* 🔹 5. Delete category */
  const deleteCategory = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("❌ Delete category failed:", err);
    }
  };

  /* 🔹 Initial load */
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /* 🔹 Context provider */
  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        fetchCategories,
        addCategory,
        updateCategory,
        updateCategoryPrices,
        deleteCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};
