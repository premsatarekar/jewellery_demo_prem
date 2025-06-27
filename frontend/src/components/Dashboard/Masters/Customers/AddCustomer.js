// src/components/Customers/AddCustomer.jsx
import React, { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import "./AddCustomer.css";

const API = process.env.REACT_APP_API_BASE_URL + "/api/customer/add";

const AddCustomer = () => {
  const navigate = useNavigate();
  const { customers, setCustomers } = useOutletContext();

  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    mobile: "",
    email: "",
    aadhar: "",
    city: "",
    pin: "",
    referenceName: "",
    referenceNo: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [serverErr, setServerErr] = useState("");

  // 👉 input restriction
  const handleChange = (e) => {
    const { name, value } = e.target;

    const alphaFields = [
      "firstName",
      "middleName",
      "lastName",
      "city",
      "referenceName",
    ];
    if (alphaFields.includes(name)) {
      if (!/^[A-Za-z\s]*$/.test(value)) return;
    }

    if (name === "mobile" && !/^\d{0,10}$/.test(value)) return;
    if (name === "aadhar" && !/^\d{0,12}$/.test(value)) return;
    if (name === "pin" && !/^\d{0,6}$/.test(value)) return;
    if (name === "referenceNo" && !/^\d*$/.test(value)) return;

    setForm({ ...form, [name]: value });
  };

  // 👉 validation on submit
  const validate = () => {
    const newErrors = {};
    const alphabetOnlyRegex = /^[A-Za-z\s]+$/;
    const mobileRegex = /^[0-9]{10}$/;
    const pinRegex = /^[0-9]{6}$/;
    const aadharRegex = /^[0-9]{12}$/;

    if (!alphabetOnlyRegex.test(form.firstName))
      newErrors.firstName = "First name should contain only letters.";
    if (form.middleName && !alphabetOnlyRegex.test(form.middleName))
      newErrors.middleName = "Middle name should contain only letters.";
    if (!alphabetOnlyRegex.test(form.lastName))
      newErrors.lastName = "Last name should contain only letters.";
    if (!mobileRegex.test(form.mobile))
      newErrors.mobile = "Mobile number should be exactly 10 digits.";
    if (!aadharRegex.test(form.aadhar))
      newErrors.aadhar = "Aadhar number must be exactly 12 digits.";
    if (!alphabetOnlyRegex.test(form.city))
      newErrors.city = "City should contain only letters.";
    if (!pinRegex.test(form.pin))
      newErrors.pin = "Pin code must be exactly 6 digits.";
    if (form.referenceName && !alphabetOnlyRegex.test(form.referenceName))
      newErrors.referenceName = "Reference name should contain only letters.";
    if (!form.address.trim()) newErrors.address = "Address is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerErr("");
    if (!validate()) return;

    try {
      const { data } = await axios.post(API, form);

      const newCustomer = { ...form, id: data.id };
      setCustomers([...customers, newCustomer]);
      navigate("/dashboard/masters/customers/list");
    } catch (err) {
      console.error(err);
      setServerErr(
        err.response?.data?.msg || "❌ Server error, please try again."
      );
    }
  };

  return (
    <div className="add-customer-container">
      <div className="add-customer-card">
        <h2>Add Customer</h2>
        {serverErr && <p className="error server-error">{serverErr}</p>}

        <form onSubmit={handleSubmit}>
          {/* Row 1 */}
          <div className="form-row">
            <div className="form-group">
              <label>
                First Name<span className="required">*</span>
              </label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                required
              />
              {errors.firstName && (
                <span className="error">{errors.firstName}</span>
              )}
            </div>

            <div className="form-group">
              <label>
                Middle Name <span className="optional">(optional)</span>
              </label>
              <input
                name="middleName"
                value={form.middleName}
                onChange={handleChange}
                placeholder="Enter middle name"
              />
              {errors.middleName && (
                <span className="error">{errors.middleName}</span>
              )}
            </div>

            <div className="form-group">
              <label>
                Last Name<span className="required">*</span>
              </label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                required
              />
              {errors.lastName && (
                <span className="error">{errors.lastName}</span>
              )}
            </div>
          </div>

          {/* Row 2 */}
          <div className="form-row">
            <div className="form-group">
              <label>
                Mobile<span className="required">*</span>
              </label>
              <input
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                required
              />
              {errors.mobile && <span className="error">{errors.mobile}</span>}
            </div>

            <div className="form-group">
              <label>
                Email <span className="optional">(optional)</span>
              </label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
            </div>

            <div className="form-group">
              <label>
                Aadhar<span className="required">*</span>
              </label>
              <input
                name="aadhar"
                value={form.aadhar}
                onChange={handleChange}
                placeholder="12-digit Aadhar number"
                required
              />
              {errors.aadhar && <span className="error">{errors.aadhar}</span>}
            </div>
          </div>

          {/* Row 3 */}
          <div className="form-row">
            <div className="form-group">
              <label>
                City<span className="required">*</span>
              </label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Enter city"
                required
              />
              {errors.city && <span className="error">{errors.city}</span>}
            </div>

            <div className="form-group">
              <label>
                Pin Code<span className="required">*</span>
              </label>
              <input
                name="pin"
                value={form.pin}
                onChange={handleChange}
                placeholder="6-digit pin code"
                required
              />
              {errors.pin && <span className="error">{errors.pin}</span>}
            </div>
          </div>

          {/* Row 4 */}
          <div className="form-row">
            <div className="form-group">
              <label>
                Reference Name <span className="optional">(optional)</span>
              </label>
              <input
                name="referenceName"
                value={form.referenceName}
                onChange={handleChange}
                placeholder="Enter reference name"
              />
              {errors.referenceName && (
                <span className="error">{errors.referenceName}</span>
              )}
            </div>

            <div className="form-group">
              <label>
                Reference No. <span className="optional">(optional)</span>
              </label>
              <input
                name="referenceNo"
                value={form.referenceNo}
                onChange={handleChange}
                placeholder="Enter reference number"
              />
            </div>
          </div>

          {/* Address */}
          <div className="form-row">
            <div className="form-group full-width">
              <label>
                Address<span className="required">*</span>
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter full address"
                required
              ></textarea>
              {errors.address && (
                <span className="error">{errors.address}</span>
              )}
            </div>
          </div>

          <button type="submit" className="submit-btn">
            Add Customer
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCustomer;
