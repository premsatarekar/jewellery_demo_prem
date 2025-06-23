import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./SalesOrderReport.css";

const API = "http://localhost:5000/api/sales/report";

export default function SalesOrderReport() {
  const [startDate, setStartDate] = useState(null); // Date | null
  const [endDate, setEndDate] = useState(null); // Date | null
  const [customerName, setCustomerName] = useState("");
  const [reportType, setReportType] = useState("daily"); // daily / weekly / monthly / quarterly

  const [sales, setSales] = useState([]);
  const [groupedSales, setGroupedSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ==========================================================
     Helpers
  ========================================================== */

  // 🔍 customer filter
  const filterSales = useCallback(() => {
    if (!customerName.trim()) return sales;
    return sales.filter((s) =>
      (s.customerName || "")
        .toLowerCase()
        .includes(customerName.trim().toLowerCase())
    );
  }, [sales, customerName]);

  // 📊 group by period
  const groupSales = useCallback(() => {
    const filtered = filterSales();
    if (!filtered.length) return [];

    const groups = {};
    filtered.forEach((sale) => {
      const date = new Date(sale.date);
      if (isNaN(date)) return; // skip bad dates
      let key = "";

      switch (reportType) {
        case "daily":
          key = date.toISOString().slice(0, 10);
          break;
        case "weekly": {
          const firstDay = new Date(date.getFullYear(), 0, 1);
          const dayOfYear = (date - firstDay) / 86400000;
          const week = Math.ceil((dayOfYear + firstDay.getDay() + 1) / 7);
          key = `${date.getFullYear()}-W${week.toString().padStart(2, "0")}`;
          break;
        }
        case "monthly":
          key = `${date.getFullYear()}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}`;
          break;
        case "quarterly": {
          const q = Math.floor(date.getMonth() / 3) + 1;
          key = `${date.getFullYear()}-Q${q}`;
          break;
        }
        default:
          key = date.toISOString().slice(0, 10);
      }

      if (!groups[key]) groups[key] = new Set();
      groups[key].add(sale.customerName);
    });

    return Object.entries(groups).map(([period, customersSet]) => ({
      period,
      customers: Array.from(customersSet).sort(),
    }));
  }, [filterSales, reportType]);

  /* ==========================================================
     Fetch API
  ========================================================== */
  const fetchSales = async () => {
    if (startDate && endDate && startDate > endDate) {
      setError("Start date cannot be after end date.");
      setSales([]);
      setGroupedSales([]);
      return;
    }

    setLoading(true);
    setError("");
    setSales([]);
    setGroupedSales([]);

    try {
      const params = {};
      if (startDate) params.start_date = startDate.toISOString().slice(0, 10);
      if (endDate) params.end_date = endDate.toISOString().slice(0, 10);
      if (customerName) params.customer_name = customerName.trim();
      params.report_type = reportType;

      const { data } = await axios.get(API, { params });

      const mapped = (data || []).map((row) => ({
        date: row.invoice_date,
        customerName: row.customer_name,
        total: row.total,
      }));
      setSales(mapped);
    } catch (err) {
      setError(err.response?.data?.msg || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* regroup jab bhi data / filters badle */
  useEffect(() => setGroupedSales(groupSales()), [groupSales]);

  /* ==========================================================
     Date handlers – yahi naya fix hai
  ========================================================== */
  const handleStartChange = (date) => {
    setStartDate(date);
    // agar start > end ho gaya to end reset
    if (endDate && date && date > endDate) setEndDate(null);
  };

  const handleEndChange = (date) => setEndDate(date);

  /* ==========================================================
     UI
  ========================================================== */
  return (
    <div className="sales-report-container">
      <h2>📋 Sales Order Report</h2>

      {/* ---------- Filters ---------- */}
      <div className="filter-section">
        <div className="date-inputs">
          {/* Start Date */}
          <ReactDatePicker
            selected={startDate}
            onChange={handleStartChange}
            onChangeRaw={(e) => e.preventDefault()} /* disable typing */
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="Start Date"
            dateFormat="yyyy-MM-dd"
            maxDate={new Date()}
            isClearable
            className="filter-input"
          />

          {/* End Date */}
          <ReactDatePicker
            selected={endDate}
            onChange={handleEndChange}
            onChangeRaw={(e) => e.preventDefault()}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            placeholderText="End Date"
            dateFormat="yyyy-MM-dd"
            maxDate={new Date()}
            isClearable
            className="filter-input"
          />

          {/* Customer */}
          <input
            type="text"
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            autoComplete="off"
            className="filter-input"
          />

          {/* Type */}
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="filter-input"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>

          {/* Button */}
          <button onClick={fetchSales} disabled={loading} className="view-btn">
            {loading ? "Loading..." : "View Report"}
          </button>
        </div>
      </div>

      {/* ---------- Messages / Report ---------- */}
      {error && <p className="status-message error">{error}</p>}

      {!loading && groupedSales.length > 0
        ? groupedSales.map(({ period, customers }) => (
            <div key={period} className="grouped-report">
              <h3>{period}</h3>
              <ul>
                {customers.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          ))
        : !loading &&
          !error && (
            <p className="status-message">
              No sales found for the selected filters.
            </p>
          )}
    </div>
  );
}
