import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddPaymentIn = ({ payments = [], setPayments }) => {
  const [form, setForm] = useState({
    customerName: "",
    balance: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "customerName") {
      const cleanName = value.replace(/[^a-zA-Z\s]/g, "");
      setForm((prev) => ({ ...prev, [name]: cleanName }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    } else if (!/^[A-Za-z\s]+$/.test(form.customerName.trim())) {
      newErrors.customerName = "Customer name must contain only letters";
    }

    if (!form.balance.trim()) {
      newErrors.balance = "Balance is required";
    } else if (isNaN(form.balance) || parseFloat(form.balance) <= 0) {
      newErrors.balance = "Balance must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const newPayment = {
      customerName: form.customerName.trim(),
      balance: parseFloat(form.balance),
    };

    const stored = JSON.parse(localStorage.getItem("payments")) || [];
    const updatedPayments = [...stored, newPayment];
    localStorage.setItem("payments", JSON.stringify(updatedPayments));

    setForm({ customerName: "", balance: "" });
    navigate("/dashboard/sales/payment-in");
  };

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background: "#f4f4f4",
      padding: "20px",
    },
    card: {
      background: "#fff",
      borderRadius: "10px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      padding: "30px",
      width: "100%",
      maxWidth: "500px",
      boxSizing: "border-box",
    },
    heading: {
      marginBottom: "20px",
      textAlign: "center",
      color: "#333",
    },
    formGroup: {
      marginBottom: "20px",
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: "600",
    },
    input: {
      width: "100%",
      padding: "10px",
      fontSize: "16px",
      border: "1px solid #ccc",
      borderRadius: "6px",
      boxSizing: "border-box",
    },
    error: {
      color: "red",
      fontSize: "14px",
      marginTop: "6px",
    },
    submitBtn: {
      width: "100%",
      padding: "12px",
      fontSize: "16px",
      backgroundColor: "#4caf50",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "bold",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Add Payment</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.formGroup}>
            <label style={styles.label}>Customer Name</label>
            <input
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              placeholder="Enter customer name"
              style={styles.input}
              aria-describedby="customerName-error"
              aria-invalid={!!errors.customerName}
            />
            {errors.customerName && (
              <p style={styles.error} id="customerName-error" role="alert">
                {errors.customerName}
              </p>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Balance</label>
            <input
              type="number"
              name="balance"
              value={form.balance}
              onChange={handleChange}
              placeholder="Enter balance amount"
              style={styles.input}
              aria-describedby="balance-error"
              aria-invalid={!!errors.balance}
            />
            {errors.balance && (
              <p style={styles.error} id="balance-error" role="alert">
                {errors.balance}
              </p>
            )}
          </div>

          <button type="submit" style={styles.submitBtn}>
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPaymentIn;
