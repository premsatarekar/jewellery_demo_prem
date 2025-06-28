import React from "react";
import { useNavigate } from "react-router-dom";
import "./StaffPage.css"; // ✅ Make sure this file defines .staff-page, .add-btn, .view-btn

export default function StaffPage() {
  const navigate = useNavigate();

  return (
    <div className="staff-page">
      <h1>👥 Staff Management</h1>
      <p>This section is accessible only to Admin users.</p>

      <div className="staff-buttons">
        <button
          onClick={() => navigate("/dashboard/staff/add")}
          className="add-btn"
        >
          ➕ Add Staff
        </button>
        <button
          onClick={() => navigate("/dashboard/staff/view")}
          className="view-btn"
        >
          👁️ View Staff
        </button>
      </div>
    </div>
  );
}
