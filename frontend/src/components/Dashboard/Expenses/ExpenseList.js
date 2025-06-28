// src/components/Dashboard/Expenses/ExpenseList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./ExpenseList.css";
import { toast } from "react-toastify";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  /* ---------- fetch all expenses once ---------- */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/expenses`);
        if (Array.isArray(data)) {
          setExpenses(data);
        } else {
          console.error("Expected array but got:", data);
          toast.error("Invalid data format received from server.");
        }
      } catch (err) {
        console.error("FETCH EXPENSES ERR:", err);
        toast.error("Failed to load expenses");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------- delete ---------- */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await axios.delete(`${API_BASE}/api/expenses/${id}`);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      toast.success("Expense deleted");
    } catch (err) {
      console.error("DELETE ERR:", err);
      toast.error("Server error — could not delete");
    }
  };

  /* ---------- filter ---------- */
  const filteredExpenses = Array.isArray(expenses)
    ? expenses.filter((expense) =>
        expense.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  /* ---------- UI ---------- */
  if (loading) return <p style={{ padding: "1rem" }}>Loading…</p>;

  return (
    <div className="expense-list-container">
      <h2>Expense List</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by expense name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Link to="/dashboard/expenses/add" className="add-button">
          Add Expense
        </Link>
      </div>

      {filteredExpenses.length === 0 ? (
        <p>No expenses found.</p>
      ) : (
        <div className="table-wrapper">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Amount (₹)</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{new Date(expense.date).toLocaleDateString("en-IN")}</td>
                  <td>{expense.name}</td>
                  <td>₹{parseFloat(expense.amount).toFixed(2)}</td>
                  <td>{expense.category}</td>
                  <td className="actions">
                    <Link
                      to={`/dashboard/expenses/edit/${expense.id}`}
                      className="edit-btn"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ExpenseList;
