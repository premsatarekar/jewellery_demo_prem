import React from 'react';
import './Navbar.css';

const Navbar = ({ toggleSidebar }) => {
  return (
    <nav className="navbar">
      <div className="menu-icon" onClick={toggleSidebar}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
      <h1 className="navbar-title">JShop Admin Panel</h1>
    </nav>
  );
};

export default Navbar;
