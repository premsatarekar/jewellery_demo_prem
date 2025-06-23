import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useVendor } from "../Vendors/VendorContext.js"; 
import "react-toastify/dist/ReactToastify.css";
import "./AddVendor.css";

const AddVendor = () => {
  /* -------------------------------------------------- */
  const { addVendor } = useVendor();   // 🔗 POST /api/vendors/add
  const navigate = useNavigate();

  /* ---------------- form state ---------------------- */
  const [vendor, setVendor] = useState({
    name: "",
    email: "",
    phone: "",
    gst: "",
    state: "",
    address: "",
  });
  const [errors, setErrors] = useState({});

  /* -------------- regex -------------------------------- */
  const alpha  = /^[A-Za-z\s]+$/;
  const phoneR = /^[0-9]{10}$/;
  const gstR   = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i;
  const mailR  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ------------- handlers ------------------------------ */
  const handleChange = (e) =>
    setVendor((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!vendor.name.trim())               e.name  = "Vendor name required";
    else if (!alpha.test(vendor.name))     e.name  = "Letters & spaces only";

    if (vendor.email && !mailR.test(vendor.email)) e.email = "Invalid email";

    if (!phoneR.test(vendor.phone))        e.phone = "Phone must be 10 digits";

    if (!gstR.test(vendor.gst))            e.gst   = "GST format invalid";

    if (!alpha.test(vendor.state))         e.state = "State letters only";

    if (!vendor.address.trim())            e.address = "Address required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* --------------- submit ----------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const res = await addVendor({
      name: vendor.name.trim(),
      email: vendor.email.trim(),
      phone: vendor.phone.trim(),
      gst:   vendor.gst.trim().toUpperCase(),
      state: vendor.state.trim(),
      address: vendor.address.trim(),
    });

    if (res.ok) {
      toast.success("✅ Vendor added!", { autoClose: 1500 });
      setTimeout(() => navigate("/dashboard/masters/vendors/list"), 1600);
    } else {
      toast.error(res.msg);
    }
  };

  /* ----------------- UI ------------------------------- */
  return (
    <div className="add-vendor-container">
      <h2>Add Vendor</h2>

      <form onSubmit={handleSubmit} className="add-vendor-form" noValidate>
        {/* Name */}
        <div className="form-group">
          <label>Vendor Name<span className="required">*</span></label>
          <input
            name="name"
            value={vendor.name}
            onChange={handleChange}
            placeholder="Enter Vendor Name"
            className={errors.name ? "input-error" : ""}
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label>Email</label>
          <input
            name="email"
            value={vendor.email}
            onChange={handleChange}
            placeholder="Enter Email (optional)"
            className={errors.email ? "input-error" : ""}
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label>Phone<span className="required">*</span></label>
          <input
            name="phone"
            value={vendor.phone}
            onChange={handleChange}
            placeholder="10‑digit phone"
            className={errors.phone ? "input-error" : ""}
          />
          {errors.phone && <span className="error">{errors.phone}</span>}
        </div>

        {/* GST */}
        <div className="form-group">
          <label>GST Number<span className="required">*</span></label>
          <input
            name="gst"
            value={vendor.gst}
            onChange={handleChange}
            placeholder="Enter GST Number"
            className={errors.gst ? "input-error" : ""}
          />
          {errors.gst && <span className="error">{errors.gst}</span>}
        </div>

        {/* State */}
        <div className="form-group">
          <label>State<span className="required">*</span></label>
          <input
            name="state"
            value={vendor.state}
            onChange={handleChange}
            placeholder="Enter State"
            className={errors.state ? "input-error" : ""}
          />
          {errors.state && <span className="error">{errors.state}</span>}
        </div>

        {/* Address */}
        <div className="form-group">
          <label>Address<span className="required">*</span></label>
          <textarea
            name="address"
            value={vendor.address}
            onChange={handleChange}
            placeholder="Enter Address"
            className={errors.address ? "input-error" : ""}
          />
          {errors.address && <span className="error">{errors.address}</span>}
        </div>

        <button type="submit" className="vendor-submit-btn">
          Add Vendor
        </button>
      </form>
    </div>
  );
};

export default AddVendor;
