// src/components/Dashboard/Masters/Customers/CustomerManager.js
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

function CustomerManager() {
  const [customers, setCustomers] = useState([]);

  // ✅ Load from localStorage safely on mount
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("customers"));
      setCustomers(Array.isArray(stored) ? stored : []);
    } catch (error) {
      console.error("Failed to parse customers from localStorage", error);
      setCustomers([]); // fallback to empty array
    }
  }, []);

  // ✅ Save to localStorage when customers change
  useEffect(() => {
    localStorage.setItem("customers", JSON.stringify(customers));
  }, [customers]);

  return (
    <div className="customer-manager-container">
      <Outlet context={{ customers, setCustomers }} />
    </div>
  );
}

export default CustomerManager;
