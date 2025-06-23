// SalesList.js
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SalesContext } from "./SalesContext";
import "./Sales.css";

const itemsPerPage = 8;

const SalesList = () => {
  const { sales, loading, error, deleteSale, refresh } =
    useContext(SalesContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    refresh(); // refresh on every visit
    setCurrentPage(1);
  }, [location.key, refresh]);

  const handleAddSales = () => navigate("/sales/billing");

  const handleDelete = async (invoiceNo) => {
    if (!window.confirm("Delete this invoice?")) return;
    try {
      await deleteSale(invoiceNo);
    } catch (err) {
      alert(err.response?.data?.msg || "Unable to delete");
    }
  };

  const handleView = (invoiceNo) =>
    navigate("/dashboard/sales/print-invoice/" + invoiceNo);
  const handleEdit = (invoiceNo) =>
    navigate(`/dashboard/sales/edit/${invoiceNo}`);

  const filtered = sales.filter(
    (s) =>
      (s.customer_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (s.invoice_no || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageCount = Math.ceil(filtered.length / itemsPerPage) || 1;
  const current = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > pageCount) setCurrentPage(pageCount);
  }, [pageCount, currentPage]);

  return (
    <div className="sales-wrapper w-100 px-4 py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Sales Orders</h2>
        <button className="btn btn-success" onClick={handleAddSales}>
          ➕ Add Sales
        </button>
      </div>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search Invoice or Customer"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
      />

      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}

      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-light">
            <tr>
              <th>SR.No</th>
              <th>Customer Name</th>
              <th>Invoice No</th>
              <th>Payment Mode</th>
              <th>State</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {current.length ? (
              current.map((sale, idx) => (
                <tr key={sale.invoice_no}>
                  <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td>{sale.customer_name}</td>
                  <td>{sale.invoice_no}</td>
                  <td>{sale.payment_mode}</td>
                  <td>{sale.state}</td>
                  <td>{Number(sale.total || 0).toFixed(2)}</td>
                  <td>
                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEdit(sale.invoice_no)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(sale.invoice_no)}
                      >
                        Delete
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleView(sale.invoice_no)}
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  {loading ? "" : "No records found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <button
          className="btn btn-secondary"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          PREVIOUS
        </button>
        <span>
          Page {currentPage} of {pageCount}
        </span>
        <button
          className="btn btn-primary"
          disabled={currentPage === pageCount}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          NEXT
        </button>
      </div>
    </div>
  );
};

export default SalesList;
