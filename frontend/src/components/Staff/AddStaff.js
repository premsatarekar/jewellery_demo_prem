import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import EyeOpen from "../../assets/eye-open.svg";
import EyeClosed from "../../assets/eye-closed.svg";
import "./AddStaff.css";

const AddStaff = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
    role: "staff",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "username" && !/^[A-Za-z]*$/.test(value)) return;
    if (name === "phone" && !/^\d{0,10}$/.test(value)) return;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    const { username, password, email, phone } = formData;

    if (!username) newErrors.username = "Username is required";
    else if (!/^[A-Za-z]{3,15}$/.test(username)) {
      newErrors.username =
        "Username must be at least 3 to 15 letters (alphabets only)";
    }

    if (!password) newErrors.password = "Password is required";

    if (!email) newErrors.email = "Email is required";
    else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
      newErrors.email =
        "Only valid Gmail addresses allowed (e.g., xyz@gmail.com)";
    }

    if (!phone) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(phone) || phone === "0000000000") {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/staff/add`,
        formData
      );
      alert("✅ Staff saved!");
      navigate("/dashboard/staff/view");
    } catch (err) {
      const msg =
        err.response?.data?.msg ||
        (err.response?.status === 409
          ? "Username / Email / Phone already exists"
          : "Server error");
      alert("❌ " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>➕ Add Staff Member</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Username (only letters)"
          value={formData.username}
          onChange={handleChange}
          maxLength={15}
        />
        {errors.username && <div className="error-msg">{errors.username}</div>}

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            maxLength={10}
          />
          <span
            className="eye-icon"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            <img
              src={showPassword ? EyeOpen : EyeClosed}
              alt={showPassword ? "Hide password" : "Show password"}
              style={{ width: "20px", height: "20px" }}
            />
          </span>
        </div>
        {errors.password && <div className="error-msg">{errors.password}</div>}

        <input
          name="email"
          type="email"
          placeholder="Enter Gmail"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <div className="error-msg">{errors.email}</div>}

        <input
          name="phone"
          placeholder="Enter 10-digit Phone Number"
          value={formData.phone}
          onChange={handleChange}
        />
        {errors.phone && <div className="error-msg">{errors.phone}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Staff"}
        </button>
      </form>
    </div>
  );
};

export default AddStaff;
