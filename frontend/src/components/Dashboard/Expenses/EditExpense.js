import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./EditExpense.css";
import { toast } from "react-toastify";

const EditExpense = () => {
  const { id } = useParams(); // 🔹 it’s now id, not index
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: "",
    name: "",
    amount: "",
    category: "",
  });
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch expense by ID
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`/api/expenses/${id}`);
        setFormData({
          name: data.name,
          date: data.date,
          amount: data.amount,
          category: data.category || "",
        });
      } catch (err) {
        console.error("FETCH ERROR:", err);
        toast.error("Failed to fetch expense");
        navigate("/dashboard/expenses");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/expenses/${id}`, {
        ...formData,
        amount: parseFloat(formData.amount),
      });
      toast.success("Expense updated successfully");
      navigate("/dashboard/expenses");
    } catch (err) {
      console.error("UPDATE ERROR:", err);
      toast.error("Failed to update expense");
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <div className="expenses-report">
      <h2>Edit Expense</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Date:
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Amount:
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Category:
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
          />
        </label>

        <button type="submit">✅ Update</button>
        <button type="button" onClick={() => navigate("/dashboard/expenses")}>
          ❌ Cancel
        </button>
      </form>
    </div>
  );
};

export default EditExpense;
