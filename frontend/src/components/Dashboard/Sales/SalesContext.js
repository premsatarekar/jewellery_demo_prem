// SalesContext.js (backend‑ready + env support)
import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const BASE = process.env.REACT_APP_API_BASE_URL;
const API = `${BASE}/api/sales`;

export const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return (
    <SalesContext.Provider
      value={{
        sales,
        setSales,
        loading,
        error,
        addSale,
        deleteSale,
        refresh: fetchSales,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};
