import React, { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import "./AddCustomer.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

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
      const { data } = await axios.post(`${API_BASE}/api/customers/add`, form);

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
          <div className="form-grid">
            {/* Row 1 */}
            <div className="input-group">
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                className={errors.firstName ? "error" : ""}
              />
              <label>
                First Name<span className="required">*</span>
              </label>
              {errors.firstName && (
                <div className="error-message">{errors.firstName}</div>
              )}
            </div>

            <div className="input-group">
              <input
                type="text"
                name="middleName"
                value={form.middleName}
                onChange={handleChange}
                required
                className={errors.middleName ? "error" : ""}
              />
              <label>
                Middle Name <span className="optional">(optional)</span>
              </label>
              {errors.middleName && (
                <div className="error-message">{errors.middleName}</div>
              )}
            </div>

            <div className="input-group">
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                className={errors.lastName ? "error" : ""}
              />
              <label>
                Last Name<span className="required">*</span>
              </label>
              {errors.lastName && (
                <div className="error-message">{errors.lastName}</div>
              )}
            </div>

            {/* Row 2 */}
            <div className="input-group">
              <input
                type="text"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                required
                className={errors.mobile ? "error" : ""}
              />
              <label>
                Mobile<span className="required">*</span>
              </label>
              {errors.mobile && (
                <div className="error-message">{errors.mobile}</div>
              )}
            </div>

            <div className="input-group">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <label>
                Email <span className="optional">(optional)</span>
              </label>
            </div>

            <div className="input-group">
              <input
                type="text"
                name="aadhar"
                value={form.aadhar}
                onChange={handleChange}
                required
                className={errors.aadhar ? "error" : ""}
              />
              <label>
                Aadhar<span className="required">*</span>
              </label>
              {errors.aadhar && (
                <div className="error-message">{errors.aadhar}</div>
              )}
            </div>

            {/* Row 3 */}
            <div className="input-group">
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                className={errors.city ? "error" : ""}
              />
              <label>
                City<span className="required">*</span>
              </label>
              {errors.city && (
                <div className="error-message">{errors.city}</div>
              )}
            </div>

            <div className="input-group">
              <input
                type="text"
                name="pin"
                value={form.pin}
                onChange={handleChange}
                required
                className={errors.pin ? "error" : ""}
              />
              <label>
                Pin Code<span className="required">*</span>
              </label>
              {errors.pin && <div className="error-message">{errors.pin}</div>}
            </div>

            {/* Row 4 */}
            <div className="input-group">
              <input
                type="text"
                name="referenceName"
                value={form.referenceName}
                onChange={handleChange}
                required
                className={errors.referenceName ? "error" : ""}
              />
              <label>
                Reference Name <span className="optional">(optional)</span>
              </label>
              {errors.referenceName && (
                <div className="error-message">{errors.referenceName}</div>
              )}
            </div>

            <div className="input-group">
              <input
                type="text"
                name="referenceNo"
                value={form.referenceNo}
                onChange={handleChange}
                required
              />
              <label>
                Reference No. <span className="optional">(optional)</span>
              </label>
            </div>

            {/* Address */}
            <div className="input-group full-width">
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                className={errors.address ? "error" : ""}
              ></textarea>
              <label>
                Address<span className="required">*</span>
              </label>
              {errors.address && (
                <div className="error-message">{errors.address}</div>
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
