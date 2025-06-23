import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const PaymentDetails = () => {
  const { customerName } = useParams();
  const [customerPayments, setCustomerPayments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedSales = JSON.parse(localStorage.getItem("sales")) || [];
    const payments = storedSales.filter(
      (sale) =>
        sale.customerName &&
        sale.customerName.toLowerCase() === customerName.toLowerCase()
    );
    setCustomerPayments(payments);
  }, [customerName]);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>{customerName}'s Payment History</h2>

      {customerPayments.length === 0 ? (
        <p style={styles.noData}>
          No payments found for <strong>{customerName}</strong>.
        </p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th style={styles.th}>SR No.</th>
                <th style={styles.th}>Invoice Number</th>
                <th style={styles.th}>Bill Amount (₹)</th>
                <th style={styles.th}>Amount Paid (₹)</th>
                <th style={styles.th}>Balance (₹)</th>
                <th style={styles.th}>Mode</th>
                <th style={styles.th}>Payment ID</th>
              </tr>
            </thead>
            <tbody>
              {customerPayments.map((payment, index) => (
                <tr key={index} style={styles.row}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>{payment.invoiceNumber || "N/A"}</td>
                  <td style={styles.td}>{parseFloat(payment.total || 0).toFixed(2)}</td>
                  <td style={styles.td}>{parseFloat(payment.amountPaid || 0).toFixed(2)}</td>
                  <td style={styles.td}>{parseFloat(payment.balance || 0).toFixed(2)}</td>
                  <td style={styles.td}>{payment.paymentMode || "N/A"}</td>
                  <td style={styles.td}>{payment.paymentId || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button onClick={() => navigate("/dashboard/sales/payment-in")} style={styles.backButton}>
        Back to Payments List
      </button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "95%",
    width: "1200px",
    margin: "30px auto",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
    textAlign: "center",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#333",
  },
  noData: {
    fontSize: "18px",
    color: "#888",
  },
  tableWrapper: {
    overflowX: "auto",
    marginBottom: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  headerRow: {
    backgroundColor: "#f4f4f4",
  },
  th: {
    padding: "12px",
    border: "1px solid #ddd",
    textAlign: "left",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "10px",
    border: "1px solid #ddd",
    textAlign: "left",
    whiteSpace: "nowrap",
  },
  row: {
    backgroundColor: "#fff",
  },
  backButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    fontWeight: "bold",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "10px",
  },
};

export default PaymentDetails;
