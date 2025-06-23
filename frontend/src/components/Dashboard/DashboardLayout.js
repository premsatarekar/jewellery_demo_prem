import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import ProfileSettings from "./Profile/ProfileSettings";
import "./DashboardLayout.css";

const DashboardLayout = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      const isWide = window.innerWidth >= 1024;
      setIsDesktop(isWide);
      if (isWide) setSidebarOpen(false); // auto-close on desktop
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // initial call

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="dashboard-container">
      {/* Hamburger Menu */}
      <button
        className="menu-btn"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      {/* Top Navigation */}
      <div className="top-nav">
        <h2 className="app-title">Jewellery Application</h2>
        <ProfileSettings onLogout={onLogout} />
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} onLogout={onLogout} />

      {/* Backdrop for mobile */}
      {sidebarOpen && !isDesktop && (
        <div className="backdrop" onClick={closeSidebar}></div>
      )}

      {/* Main Content Area */}
      <div
        className={`main-content ${sidebarOpen && isDesktop ? "with-sidebar" : ""}`}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
