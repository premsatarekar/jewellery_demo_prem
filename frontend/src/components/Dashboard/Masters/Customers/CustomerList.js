// src/components/Dashboard/Masters/Customers/CustomerList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CustomerList.css";

// ✅ Load environment variable
const API_BASE = process.env.REACT_APP_API_BASE_URL;

const CustomerList = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCustomers = customers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/customers`);
        setCustomers(data);
      } catch (err) {
        console.error("Fetch customer failed:", err);
        alert("Failed to fetch customers. Please check server or network.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getFullName = (c) =>
    [c.first_name, c.middle_name, c.last_name].filter(Boolean).join(" ") ||
    "N/A";

  const safe = (v, opt = false) =>
    !v || v.trim() === "" ? (opt ? "Nil" : "N/A") : v;

  const handleEdit = (custId) =>
    navigate(`/dashboard/masters/customers/edit/${custId}`);

  const handleDelete = async (custId) => {
    if (
      !custId ||
      !window.confirm("Delete this customer? This action cannot be undone.")
    )
      return;

    try {
      await axios.delete(`${API_BASE}/api/customers/${custId}`);
      setCustomers((prev) => prev.filter((c) => c.id !== custId));
      setCurrentPage((p) =>
        p > 1 && customers.length - 1 <= (p - 1) * itemsPerPage ? p - 1 : p
      );
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Server error while deleting customer.");
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div className="customer-list-container">
      <h2>Customer List</h2>

      <div className="table-wrapper">
        <table
          className="customer-table"
          role="table"
          aria-label="Customer List Table"
        >
          <thead>
            <tr>
              <th>Sr No.</th>
              <th>Full Name</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Aadhar</th>
              <th>City</th>
              <th>Pin Code</th>
              <th>Reference Name</th>
              <th>Reference No.</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentCustomers.length ? (
              currentCustomers.map((c, idx) => (
                <tr key={c.id}>
                  <td>{startIndex + idx + 1}</td>
                  <td>{getFullName(c)}</td>
                  <td>{safe(c.mobile)}</td>
                  <td>{safe(c.email, true)}</td>
                  <td>{safe(c.aadhar)}</td>
                  <td>{safe(c.city)}</td>
                  <td>{safe(c.pin_code)}</td>
                  <td>{safe(c.reference_name, true)}</td>
                  <td>{safe(c.reference_no, true)}</td>
                  <td>{safe(c.address)}</td>
                  <td>
                    <div className="action-buttons">
                      <span
                        role="button"
                        tabIndex={0}
                        title="Edit"
                        onClick={() => handleEdit(c.id)}
                        onKeyDown={(e) =>
                          (e.key === "Enter" || e.key === " ") &&
                          handleEdit(c.id)
                        }
                      >
                        Edit
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        title="Delete"
                        onClick={() => handleDelete(c.id)}
                        onKeyDown={(e) =>
                          (e.key === "Enter" || e.key === " ") &&
                          handleDelete(c.id)
                        }
                      >
                        Delete
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="no-data">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
