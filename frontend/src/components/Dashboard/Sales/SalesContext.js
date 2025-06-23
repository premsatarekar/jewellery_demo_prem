// SalesContext.js (backend‑ready)
import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/sales";

export const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  /* ---------------- state ---------------- */
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ---------------- helpers ---------------- */
  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(API);
      setSales(data);
    } catch (err) {
      console.error("FETCH SALES ERR", err);
      setError(err.response?.data?.msg || "Unable to load sales");
    } finally {
      setLoading(false);
    }
  }, []);

  const addSale = async (payload) => {
    try {
      const { data } = await axios.post(API + "/add", payload);
      // Append to list optimistically
      setSales((prev) => [...prev, { id: data.id, ...payload }]);
      return data;
    } catch (err) {
      console.error("ADD SALE ERR", err);
      throw err;
    }
  };

  const deleteSale = async (invoiceNo) => {
    try {
      await axios.delete(`${API}/${invoiceNo}`);
      setSales((prev) => prev.filter((s) => s.invoice_no !== invoiceNo));
    } catch (err) {
      console.error("DELETE SALE ERR", err);
      throw err;
    }
  };

  /* ---------------- bootstrap ---------------- */
  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  /* ---------------- provider ---------------- */
  return (
    <SalesContext.Provider
      value={{ sales, setSales, loading, error, addSale, deleteSale, refresh: fetchSales }}
    >
      {children}
    </SalesContext.Provider>
  );
};
