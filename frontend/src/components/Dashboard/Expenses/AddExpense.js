import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";              // 🔹 NEW
import { toast } from "react-toastify";
import "./AddExpense.css";

const AddExpense = () => {
  const navigate = useNavigate();

  /* ---------- form state ---------- */
  const [form, setForm] = useState({
    name: "",
    category: "",
    date: "",
    amount: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /* ---------- validation ---------- */
  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Expense name is required";
    if (!form.category.trim()) newErrors.category = "Category is required";
    if (!form.date) newErrors.date = "Date is required";
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
      newErrors.amount = "Valid amount required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------- handlers ---------- */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      date: form.date,
      amount: parseFloat(form.amount),
    };

    try {
      setSaving(true);
      await axios.post("/api/expenses", payload);      // 🔹 BACKEND CALL
      toast.success("Expense added!", { autoClose: 1500 });
      navigate("/dashboard/expenses");
    } catch (err) {
      console.error("ADD EXPENSE ERR:", err);
      toast.error(
        err.response?.data?.msg || "Server error. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="add-expense-container">
      <h2>Add New Expense</h2>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label>Expense Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
          {errors.name && <span className="error-msg">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
          />
          {errors.category && (
            <span className="error-msg">{errors.category}</span>
          )}
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />
          {errors.date && <span className="error-msg">{errors.date}</span>}
        </div>

        <div className="form-group">
          <label>Amount</label>
          <input
            type="number"
            name="amount"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
          />
          {errors.amount && (
            <span className="error-msg">{errors.amount}</span>
          )}
        </div>

        <button
          type="submit"
          className="submit-expense"
          disabled={saving}
        >
          {saving ? "Saving…" : "Add Expense"}
        </button>
      </form>
    </div>
  );
};

export default AddExpense;
