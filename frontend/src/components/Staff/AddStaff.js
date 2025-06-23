import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddStaff = () => {
  const navigate = useNavigate();

  /* ---------- local state ---------- */
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
    role: "staff",
  });
  const [loading, setLoading] = useState(false);

  /* ---------- change handler ---------- */
  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  /* ---------- submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password, email, phone } = formData;
    if (!username || !password || !email || !phone) {
      alert("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/staff/add", formData);
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

  /* ---------- UI ---------- */
  return (
    <>
      {/* inline <style> – saara CSS yahin pe */}
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
        /* ---------- responsive tweaks ---------- */
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
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            name="phone"
            placeholder="Phone"
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
