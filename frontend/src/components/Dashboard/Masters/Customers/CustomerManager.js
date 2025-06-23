// src/components/Dashboard/Masters/Customers/CustomerManager.js
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";



function CustomerManager() {
  const [customers, setCustomers] = useState([]);

  
  // Load from localStorage initially
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("customers")) || [];
    setCustomers(stored);
  }, []);

  // Save to localStorage on change
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
