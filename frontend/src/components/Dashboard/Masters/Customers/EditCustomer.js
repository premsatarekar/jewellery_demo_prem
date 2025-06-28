// src/components/Dashboard/Masters/Customers/EditCustomer.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./EditCustomer.css";

const EditCustomer = () => {
  /* -------- URL / router -------- */
  const { customerId } = useParams(); // `/edit/:customerId`
  const navigate = useNavigate();

  /* -------- state -------- */
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    mobile: "",
    aadhar: "",
    city: "",
    pin: "",
    referenceName: "",
    referenceNo: "",
    address: "",
  });
  const [errors, setErrors] = useState({});

  /* ===========================================================
     1️⃣  FETCH CUSTOMER ONCE (GET /api/customers/:id)
  =========================================================== */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          `https://jewellery-demo-backend.onrender.com/api/customer/${customerId}`
        );

        setForm({
          firstName: data.first_name,
          middleName: data.middle_name || "",
          lastName: data.last_name,
          email: data.email || "",
          mobile: data.mobile,
          aadhar: data.aadhar,
          city: data.city,
          pin: data.pin_code,
          referenceName: data.reference_name || "",
          referenceNo: data.reference_no || "",
          address: data.address,
        });
      } catch (err) {
        toast.error(
          err.response?.status === 404 ? "Customer not found" : "Server error"
        );
        navigate("/dashboard/masters/customers/list");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  /* ===========================================================
     2️⃣  WARN ON REFRESH IF UNSAVED
  =========================================================== */
  useEffect(() => {
    const warn = (e) => {
      if (!loading) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [loading]);

  /* ===========================================================
     3️⃣  VALIDATION
  =========================================================== */
  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "First name required";
    if (!form.lastName.trim()) errs.lastName = "Last name required";
    if (!form.mobile.trim()) errs.mobile = "Mobile required";
    if (!form.aadhar.trim()) errs.aadhar = "Aadhar required";
    if (!form.city.trim()) errs.city = "City required";
    if (!form.pin.trim()) errs.pin = "Pin required";
    if (!form.address.trim()) errs.address = "Address required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* -------- handlers -------- */
  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  /* ===========================================================
     4️⃣  SAVE (PUT /api/customers/:id)
  =========================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      firstName: form.firstName.trim(),
      middleName: form.middleName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      aadhar: form.aadhar.trim(),
      city: form.city.trim(),
      pin: form.pin.trim(),
      referenceName: form.referenceName.trim(),
      referenceNo: form.referenceNo.trim(),
      address: form.address.trim(),
    };

    try {
      await axios.put(
        `https://jewellery-demo-backend.onrender.com/api/customer/${customerId}`,
        payload
      );
      toast.success("Customer updated!", { autoClose: 1500 });
      setTimeout(() => navigate("/dashboard/masters/customers/list"), 1600);
    } catch (err) {
      toast.error(
        err.response?.data?.msg ||
          (err.response?.status === 409
            ? "Mobile or Aadhar already exists"
            : "Server error")
      );
    }
  };

  /* ===========================================================
     5️⃣  UI
  =========================================================== */
  if (loading) return <p>Loading…</p>;

  return (
    <form className="edit-customer-form" onSubmit={handleSubmit}>
      <h2>Edit Customer</h2>

      {/* ------------ First / Middle / Last -------------- */}
      <div className="form-group">
        <label>First Name*</label>
        <input
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          placeholder="Enter First Name"
          type="text"
        />
        {errors.firstName && <span className="error">{errors.firstName}</span>}
      </div>

      <div className="form-group">
        <label>Middle Name</label>
        <input
          name="middleName"
          value={form.middleName}
          onChange={handleChange}
          placeholder="Enter Middle Name"
          type="text"
        />
      </div>

      <div className="form-group">
        <label>Last Name*</label>
        <input
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          placeholder="Enter Last Name"
          type="text"
        />
        {errors.lastName && <span className="error">{errors.lastName}</span>}
      </div>

      {/* ------------ Email / Mobile / Aadhar ------------- */}
      <div className="form-group">
        <label>Email</label>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter Email (optional)"
          type="email"
        />
      </div>

      <div className="form-group">
        <label>Mobile*</label>
        <input
          name="mobile"
          value={form.mobile}
          onChange={handleChange}
          placeholder="Enter Mobile Number"
          type="tel"
        />
        {errors.mobile && <span className="error">{errors.mobile}</span>}
      </div>

      <div className="form-group">
        <label>Aadhar*</label>
        <input
          name="aadhar"
          value={form.aadhar}
          onChange={handleChange}
          placeholder="Enter Aadhar Number"
          type="text"
        />
        {errors.aadhar && <span className="error">{errors.aadhar}</span>}
      </div>

      {/* ------------ City / Pin ------------- */}
      <div className="form-group">
        <label>City*</label>
        <input
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder="Enter City"
          type="text"
        />
        {errors.city && <span className="error">{errors.city}</span>}
      </div>

      <div className="form-group">
        <label>Pin Code*</label>
        <input
          name="pin"
          value={form.pin}
          onChange={handleChange}
          placeholder="Enter Pin Code"
          type="text"
        />
        {errors.pin && <span className="error">{errors.pin}</span>}
      </div>

      {/* ------------ Reference ------------- */}
      <div className="form-group">
        <label>Reference Name</label>
        <input
          name="referenceName"
          value={form.referenceName}
          onChange={handleChange}
          placeholder="Enter Reference Name"
          type="text"
        />
      </div>

      <div className="form-group">
        <label>Reference No.</label>
        <input
          name="referenceNo"
          value={form.referenceNo}
          onChange={handleChange}
          placeholder="Enter Reference Number"
          type="text"
        />
      </div>

      {/* ------------ Address ------------- */}
      <div className="form-group">
        <label>Address*</label>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Enter Address"
        />
        {errors.address && <span className="error">{errors.address}</span>}
      </div>

      <button type="submit" className="save-btn">
        Save
      </button>
    </form>
  );
};

export default EditCustomer;
