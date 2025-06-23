// src/components/Vendors/VendorList.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVendor } from "./VendorContext.js";     
import "./Vendor.css";

const VendorList = () => {
  /* ---------------- context ---------------- */
  const {
    vendors,          
    loading,          
    deleteVendor,     
    updateVendor,     
  } = useVendor();

  /* ---------------- local state ------------- */
  const [editId, setEditId]       = useState(null);   
  const [editData, setEditData]   = useState({});
  const navigate = useNavigate();

  /* ---------- handlers ---------------------- */
  const startEdit = (v) => {
    setEditId(v.id);
    setEditData({ ...v });
  };

  const handleChange = (e) =>
    setEditData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const saveEdit = async () => {
    const res = await updateVendor(editId, editData);
    if (res.ok) setEditId(null);
    else alert(res.msg);
  };

  const cancelEdit = () => setEditId(null);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this vendor?")) {
      await deleteVendor(id);
      navigate("/dashboard/masters/vendors/list"); 
    }
  };

  /* ---------- UI ---------------------------- */
  if (loading) return <p>Loading…</p>;
  if (!vendors.length) return <p>No vendors found.</p>;

  return (
    <div className="vendor-list-container">
      <h2>Vendor List</h2>

      <table className="vendor-table">
        <thead>
          <tr>
            <th>Vendor Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>GST</th>
            <th>State</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {vendors.map((v) => (
            <tr key={v.id}>
              {editId === v.id ? (
                /* ---------- edit mode ---------- */
                <>
                  <td><input  name="name"  value={editData.name}  onChange={handleChange} /></td>
                  <td><input  name="email" value={editData.email} onChange={handleChange} /></td>
                  <td><input  name="phone" value={editData.phone} onChange={handleChange} /></td>
                  <td><input  name="gst"   value={editData.gst}   onChange={handleChange} /></td>
                  <td><input  name="state" value={editData.state} onChange={handleChange} /></td>
                  <td>
                    <button onClick={saveEdit}>Save</button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </td>
                </>
              ) : (
                /* ---------- view mode ---------- */
                <>
                  <td>{v.name}</td>
                  <td>{v.email || "N/A"}</td>
                  <td>{v.phone}</td>
                  <td>{v.gst}</td>
                  <td>{v.state}</td>
                  <td>
                    <button onClick={() => startEdit(v)}>Edit</button>
                    <button onClick={() => handleDelete(v.id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VendorList;
