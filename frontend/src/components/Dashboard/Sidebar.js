import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext"; // ✅ Correct path
import "./Sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useUser();
  const role = user.role;

  const [openMenu, setOpenMenu] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState(null);

  const toggleMenu = useCallback((menuName) => {
    setOpenSubMenu(null);
    setOpenMenu((prevMenu) => (prevMenu === menuName ? null : menuName));
  }, []);

  const toggleSubMenu = useCallback((subMenuName) => {
    setOpenSubMenu((prev) => (prev === subMenuName ? null : subMenuName));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        toggleSidebar();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, toggleSidebar]);

  return (
    <>
      <button
        className={`hamburger ${isOpen ? "open" : ""}`}
        onClick={toggleSidebar}
        aria-label={isOpen ? "Close sidebar menu" : "Open sidebar menu"}
        aria-expanded={isOpen}
        aria-controls="sidebar"
      >
        <div />
        <div />
        <div />
      </button>

      <nav id="sidebar" className={`sidebar ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
        <div className="sidebar-header">
          <img src="/images/logoo.png" alt="JShop Logo" className="sidebar-logo" loading="lazy" />
        </div>

        <ul className="sidebar-menu" role="menu">
          <li>
            <Link to="/dashboard/admin-dashboard" className="sidebar-link" onClick={toggleSidebar}>
              📊 Dashboard
            </Link>
          </li>

          {/* Superadmin-only section */}
          {role === "superadmin" && (
            <>
              {/* Masters */}
              <li className="sidebar-link" onClick={() => toggleMenu("masters")}>
                🧾 Masters <span className="arrow">{openMenu === "masters" ? "▲" : "▼"}</span>
              </li>
              {openMenu === "masters" && (
                <ul className="submenu">
                  <li className="sidebar-link" onClick={() => toggleSubMenu("products")}>
                    📦 Products <span className="arrow">{openSubMenu === "products" ? "▲" : "▼"}</span>
                  </li>
                  {openSubMenu === "products" && (
                    <ul className="submenu nested">
                      <li><Link to="/dashboard/masters/products/add" className="sidebar-sublink" onClick={toggleSidebar}>➕ Add Product</Link></li>
                      <li><Link to="/dashboard/masters/products/excel-import" className="sidebar-sublink" onClick={toggleSidebar}>📥 Excel Import</Link></li>
                      <li><Link to="/dashboard/masters/products" className="sidebar-sublink" onClick={toggleSidebar}>📃 Product List</Link></li>
                    </ul>
                  )}

                  <li className="sidebar-link" onClick={() => toggleSubMenu("categories")}>
                    🗂️ Categories <span className="arrow">{openSubMenu === "categories" ? "▲" : "▼"}</span>
                  </li>
                  {openSubMenu === "categories" && (
                    <ul className="submenu nested">
                      <li><Link to="/dashboard/masters/categories/add" className="sidebar-sublink" onClick={toggleSidebar}>➕ Add Category</Link></li>
                      <li><Link to="/dashboard/masters/categories" className="sidebar-sublink" onClick={toggleSidebar}>📃 Category List</Link></li>
                    </ul>
                  )}

                  <li className="sidebar-link" onClick={() => toggleSubMenu("customers")}>
                    🧑‍🤝‍🧑 Customers <span className="arrow">{openSubMenu === "customers" ? "▲" : "▼"}</span>
                  </li>
                  {openSubMenu === "customers" && (
                    <ul className="submenu nested">
                      <li><Link to="/dashboard/masters/customers/add" className="sidebar-sublink" onClick={toggleSidebar}>➕ Add Customer</Link></li>
                      <li><Link to="/dashboard/masters/customers/list" className="sidebar-sublink" onClick={toggleSidebar}>📃 Customer List</Link></li>
                    </ul>
                  )}

                  <li className="sidebar-link" onClick={() => toggleSubMenu("vendors")}>
                    🏪 Vendors <span className="arrow">{openSubMenu === "vendors" ? "▲" : "▼"}</span>
                  </li>
                  {openSubMenu === "vendors" && (
                    <ul className="submenu nested">
                      <li><Link to="/dashboard/masters/vendors/add" className="sidebar-sublink" onClick={toggleSidebar}>➕ Add Vendor</Link></li>
                      <li><Link to="/dashboard/masters/vendors/list" className="sidebar-sublink" onClick={toggleSidebar}>📃 Vendor List</Link></li>
                    </ul>
                  )}
                </ul>
              )}

              {/* Sales Section */}
              <li className="sidebar-link" onClick={() => toggleMenu("sales")}>
                💰 Sales <span className="arrow">{openMenu === "sales" ? "▲" : "▼"}</span>
              </li>
              {openMenu === "sales" && (
                <ul className="submenu">
                  <li><Link to="/dashboard/sales/list" className="sidebar-sublink" onClick={toggleSidebar}>🛒 Sales List</Link></li>
                  <li><Link to="/dashboard/sales/payment-in" className="sidebar-sublink" onClick={toggleSidebar}>💵 Payment In</Link></li>
                  <li><Link to="/dashboard/reports/sales" className="sidebar-sublink" onClick={toggleSidebar}>📈 Sales Report</Link></li>
                </ul>
              )}

              {/* Expenses */}
              <li className="sidebar-link" onClick={() => toggleMenu("expenses")}>
                💸 Expenses <span className="arrow">{openMenu === "expenses" ? "▲" : "▼"}</span>
              </li>
              {openMenu === "expenses" && (
                <ul className="submenu">
                  <li><Link to="/dashboard/expenses" className="sidebar-sublink" onClick={toggleSidebar}>🧾 Expense List</Link></li>
                  <li><Link to="/dashboard/expenses/add" className="sidebar-sublink" onClick={toggleSidebar}>➕ Add Expense</Link></li>
                  <li><Link to="/dashboard/expenses/report" className="sidebar-sublink" onClick={toggleSidebar} > 📊 Expenses Report</Link></li>

                </ul>
              )}

              {/* Staff Section */}
              <li>
                <Link to="/dashboard/staff/view" className="sidebar-link" onClick={toggleSidebar}>👥 Staff</Link>
              </li>
            </>
          )}

          {/* Worker-only route (SalesAdd) */}
          {role === "worker" && (
            <li>
              <Link to="/dashboard/sales/add" className="sidebar-link" onClick={toggleSidebar}>
                🧾 Add Sales
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
};

export default Sidebar;
