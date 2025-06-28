import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddStaff = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
    role: "staff",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 👉 input restriction for username (only alphabets)
    if (name === "username") {
      if (!/^[A-Za-z]*$/.test(value)) return; // block numbers/symbols
    }

    // 👉 phone: max 10 digits only
    if (name === "phone") {
      if (!/^\d{0,10}$/.test(value)) return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const { username, password, email, phone } = formData;

    const usernameRegex = /^[A-Za-z]{1,}$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!username || !password || !email || !phone) {
      alert("❗ All fields are required");
      return false;
    }

    if (!usernameRegex.test(username)) {
      alert("❌ Username must contain only letters (no numbers/symbols)");
      return false;
    }

    if (!email.endsWith("@gmail.com")) {
      alert("❌ Email must be a valid Gmail (e.g., user@gmail.com)");
      return false;
    }

    if (!phoneRegex.test(phone)) {
      alert("❌ Phone number must be exactly 10 digits");
      return false;
    }

    return true;
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
    <>
      <style>{`
        .card {
          max-width: 420px;
          margin: 2rem auto;
          padding: 2rem 1.5rem;
          border-radius: 0.75rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          background: #ffffff;
        }
        .card h2 {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 1.25rem;
          text-align: center;
        }
        .card input {
          width: 100%;
          padding: 0.6rem 0.8rem;
          margin-bottom: 0.9rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.95rem;
        }
        .card button {
          width: 100%;
          padding: 0.7rem 0;
          background: #2563eb;
          color: #fff;
          font-weight: 500;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .card button:hover:not(:disabled) {
          background: #1e40af;
        }
        .card button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        @media (max-width: 480px) {
          .card {
            padding: 1.5rem 1rem;
            margin: 1rem;
          }
          .card h2 {
            font-size: 1.15rem;
          }
        }
      `}</style>

      <div className="card">
        <h2>➕ Add Staff Member</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="username"
            placeholder="Username (only letters)"
            value={formData.username}
            onChange={handleChange}
          />

          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              style={{ paddingRight: "2.5rem" }}
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              style={{
                position: "absolute",
                top: "50%",
                right: "10px",
                transform: "translateY(-50%)",
                cursor: "pointer",
                fontSize: "1rem",
                userSelect: "none",
              }}
            >
              {showPassword ? "👁️" : "🙈"}
            </span>
          </div>

          <input
            name="email"
            type="email"
            placeholder="Email (must be gmail)"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            name="phone"
            placeholder="Phone (10 digits)"
            value={formData.phone}
            onChange={handleChange}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Staff"}
          </button>
        </form>
      </div>
    </>
  );
};

export default AddStaff;
