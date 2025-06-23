import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const PaymentIn = () => {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;

  useEffect(() => {
    const storedPayments = JSON.parse(localStorage.getItem("payments")) || [];
    setPayments(storedPayments);
  }, []);

  const filtered = payments.filter((p) =>
    p.customerName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedData = filtered.slice(startIndex, startIndex + recordsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const styles = {
    container: {
      maxWidth: "1000px",
      margin: "40px auto",
      padding: "20px 30px",
      background: "#fff",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      borderRadius: "12px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      marginBottom: "20px",
    },
    addBtn: {
      backgroundColor: "#4caf50",
      color: "white",
      padding: "8px 16px",
      border: "none",
      fontWeight: "bold",
      borderRadius: "6px",
      textDecoration: "none",
    },
    searchBar: {
      marginBottom: "15px",
      display: "flex",
      justifyContent: "flex-end",
    },
    searchInput: {
      padding: "8px 12px",
      width: "250px",
      borderRadius: "6px",
      border: "1px solid #ccc",
    },
    tableWrap: {
      overflowX: "auto",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "600px",
    },
    th: {
      padding: "12px 15px",
      textAlign: "left",
      backgroundColor: "#f5f5f5",
      color: "#444",
      borderBottom: "1px solid #e0e0e0",
    },
    td: {
      padding: "12px 15px",
      textAlign: "left",
      borderBottom: "1px solid #e0e0e0",
    },
    noData: {
      textAlign: "center",
      padding: "20px",
      color: "#999",
      fontStyle: "italic",
    },
    detailsBtn: {
      backgroundColor: "#1976d2",
      color: "white",
      padding: "6px 12px",
      border: "none",
      fontSize: "0.9rem",
      borderRadius: "5px",
      cursor: "pointer",
    },
    pagination: {
      marginTop: "20px",
      display: "flex",
      justifyContent: "center",
      gap: "8px",
      flexWrap: "wrap",
    },
    pageBtn: {
      padding: "6px 12px",
      border: "1px solid #ccc",
      backgroundColor: "white",
      borderRadius: "5px",
      cursor: "pointer",
    },
    activePageBtn: {
      backgroundColor: "#1976d2",
      color: "white",
      borderColor: "#1976d2",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Sales Payment List</h2>
        <Link to="/dashboard/sales/payment-in/add" style={styles.addBtn}>
          + Add Payment
        </Link>
      </div>

      <div style={styles.searchBar}>
        <input
          type="text"
          style={styles.searchInput}
          placeholder="Search Customer"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>SR No.</th>
              <th style={styles.th}>Customer Name</th>
              <th style={styles.th}>Balance</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((payment, index) => (
                <tr key={index}>
                  <td style={styles.td}>{startIndex + index + 1}</td>
                  <td style={styles.td}>{payment.customerName}</td>
                  <td style={styles.td}>
                    {parseFloat(payment.balance || 0).toLocaleString()}
                  </td>
                  <td style={styles.td}>
                    <Link
                      to={`/dashboard/sales/payment-in/details/${payment.customerName}`}
                    >
                      <button style={styles.detailsBtn}>See Details</button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={styles.noData}>
                  No payments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            style={styles.pageBtn}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              style={{
                ...styles.pageBtn,
                ...(currentPage === idx + 1 ? styles.activePageBtn : {}),
              }}
              onClick={() => handlePageChange(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
          <button
            style={styles.pageBtn}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentIn;
