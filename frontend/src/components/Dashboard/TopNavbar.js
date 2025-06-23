import React from "react";
import './DashboardLayout.css';

const TopNavbar = ({ toggleSidebar }) => {
  // Validate toggleSidebar prop is a function
  if (typeof toggleSidebar !== 'function') {
    console.error('toggleSidebar prop must be a function');
    return null;
  }

  return (
    <nav className="top-nav" role="navigation" aria-label="Main navigation">
      <button
        onClick={toggleSidebar}
        className="menu-btn"
        aria-label="Toggle sidebar menu"
        type="button"
      >
        ☰
      </button>
      <h1 className="app-title" style={{ color: 'white' }}>
        Jewellery Application
      </h1>
      <div className="profile-settings-wrapper">
        <img
          src="/profile.png"
          alt="User Profile"
          className="profile-img"
          loading="lazy"
          width={40}
          height={40}
        />
      </div>
    </nav>
  );
};

export default TopNavbar;
