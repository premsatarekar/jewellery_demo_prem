import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ViewStaff = () => {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const { data } = await axios.get("/api/staff");
        setStaffList(data);
      } catch (err) {
        console.error("❌ Staff fetch failed:", err);
        alert("Unable to load staff list.");
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  const handleEdit = async (idx, updated) => {
    const id = staffList[idx].id;
    try {
      await axios.put(`/api/staff/${id}`, updated);
      const newList = [...staffList];
      newList[idx] = { ...updated, id };
      setStaffList(newList);
    } catch (err) {
      console.error("❌ Update failed:", err);
      alert("Failed to update staff.");
    }
  };

  const handleDelete = async (idx) => {
    const id = staffList[idx].id;
    if (!window.confirm("Are you sure you want to delete this staff member?"))
      return;
    try {
      await axios.delete(`/api/staff/${id}`);
      setStaffList((prev) => prev.filter((_, i) => i !== idx));
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("Failed to delete staff.");
    }
  };

  if (loading) return <p style={{ padding: "1rem" }}>Loading…</p>;

  return (
    <>
      <style>{`
        .staff-container {
          max-width: 1000px;
          margin: 2rem auto;
          padding: 2rem;
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .staff-header {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 1rem;
          text-align: center;
        }
        .add-btn {
          background: #2563eb;
          color: white;
          padding: 0.6rem 1rem;
          border: none;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          cursor: pointer;
        }
        .add-btn:hover {
          background: #1e40af;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 700px;
        }
        thead {
          background-color: #f3f4f6;
          position: sticky;
          top: 0;
        }
        th, td {
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          text-align: left;
        }
        tbody tr:nth-child(even) {
          background-color: #f9fafb;
        }
        tbody tr:hover {
          background-color: #f1f5f9;
        }
        input[type="text"], input[type="email"], input[type="password"] {
          width: 100%;
          padding: 0.4rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.4rem;
        }
        .action-btn {
          padding: 5px 10px;
          margin-right: 6px;
          font-size: 0.85rem;
          border: 1px solid #ccc;
          background: white;
          color: #333;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .action-btn:hover {
          background-color: #f3f4f6;
        }
        @media (max-width: 600px) {
          .staff-container {
            padding: 1rem;
            margin: 1rem;
          }
          th, td {
            white-space: nowrap;
            font-size: 0.85rem;
          }
        }
      `}</style>

      <div className="staff-container">
        <div className="staff-header">👥 Staff Members</div>
        <button className="add-btn" onClick={() => navigate("/dashboard/staff/add")}>
          ➕ Add Staff
        </button>

        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Password</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffList.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "1rem" }}>
                    No staff members found.
                  </td>
                </tr>
              ) : (
                staffList.map((staff, index) => (
                  <StaffRow
                    key={staff.id}
                    index={index}
                    staff={staff}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

const StaffRow = ({ index, staff, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState({ ...staff });

  const handleSave = () => {
    if (
      !edited.username.trim() ||
      !edited.password.trim() ||
      !edited.email.trim() ||
      !edited.phone.trim()
    ) {
      alert("Please fill in all fields.");
      return;
    }
    onEdit(index, edited);
    setIsEditing(false);
  };

  return (
    <tr>
      {["username", "password", "email", "phone"].map((field) => (
        <td key={field}>
          {isEditing ? (
            <input
              type={field === "email" ? "email" : "text"}
              value={edited[field]}
              onChange={(e) => setEdited({ ...edited, [field]: e.target.value })}
              required
            />
          ) : (
            staff[field]
          )}
        </td>
      ))}
      <td>{staff.role || "staff"}</td>
      <td style={{ textAlign: "center" }}>
        {isEditing ? (
          <>
            <button className="action-btn" title="Save" onClick={handleSave}>
              💾 Save
            </button>
            <button className="action-btn" title="Cancel" onClick={() => setIsEditing(false)}>
              ❌ Cancel
            </button>
          </>
        ) : (
          <>
            <button className="action-btn" title="Edit" onClick={() => setIsEditing(true)}>
              ✏️ Edit
            </button>
            <button className="action-btn" title="Delete" onClick={() => onDelete(index)}>
              🗑️ Delete
            </button>
          </>
        )}
      </td>
    </tr>
  );
};

export default ViewStaff;
