import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ExpensesReport.css";
import { toast } from "react-toastify";

const ExpensesReport = () => {
  const [filterType, setFilterType] = useState("");
  const [allExpenses, setAllExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- fetch all expenses once ---------- */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/api/expenses");
        setAllExpenses(data);
      } catch (err) {
        console.error("FETCH EXPENSES ERR:", err);
        toast.error("Failed to load expenses");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------- filter change ---------- */
  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
    setFilteredExpenses([]);
  };

  /* ---------- generate report ---------- */
  const handleViewReport = () => {
    if (!filterType) {
      toast.warn("Please select a filter type.");
      return;
    }
    if (!allExpenses.length) {
      toast.info("No expenses available.");
      setFilteredExpenses([]);
      return;
    }

    const now = new Date();
    let filtered = [];

    switch (filterType) {
      case "daily":
        filtered = allExpenses.filter((e) => {
          const d = new Date(e.date);
          return d.toDateString() === now.toDateString();
        });
        break;

      case "weekly": {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        filtered = allExpenses.filter((e) => {
          const d = new Date(e.date);
          return d >= start && d <= end;
        });
        break;
      }

      case "monthly":
        filtered = allExpenses.filter((e) => {
          const d = new Date(e.date);
          return (
            d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
          );
        });
        break;

      case "quarterly": {
        const q = Math.floor(now.getMonth() / 3);
        filtered = allExpenses.filter((e) => {
          const d = new Date(e.date);
          return (
            d.getFullYear() === now.getFullYear() &&
            Math.floor(d.getMonth() / 3) === q
          );
        });
        break;
      }

      default:
        filtered = [];
    }

    setFilteredExpenses(filtered);
  };

  const totalAmount = filteredExpenses
    .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
    .toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ---------- UI ---------- */
  if (loading) return <p style={{ padding: "1rem" }}>Loading…</p>;

  return (
    <div className="expenses-report-container">
      <h2 className="title">Expenses Report</h2>

      <div className="filter-controls">
        <select value={filterType} onChange={handleFilterChange}>
          <option value="">-- Select Filter --</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
        </select>

        <button className="view-btn" onClick={handleViewReport}>
          View Report
        </button>
      </div>

      {filteredExpenses.length > 0 ? (
        <>
          <table className="report-table">
            <thead>
              <tr>
                <th>SR No.</th>
                <th>Date</th>
                <th>Name</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((e, i) => (
                <tr key={e.id}>
                  <td>{i + 1}</td>
                  <td>{new Date(e.date).toLocaleDateString()}</td>
                  <td>{e.name}</td>
                  <td>{parseFloat(e.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="total-section">
            <strong>Total: ₹{totalAmount}</strong>
          </div>
        </>
      ) : (
        <p className="no-results">No expenses found for the selected filter.</p>
      )}
    </div>
  );
};

export default ExpensesReport;
