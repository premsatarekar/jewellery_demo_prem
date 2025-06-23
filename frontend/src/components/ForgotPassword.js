import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AuthForm.css"; // same style reuse

const API_BASE = "http://localhost:5000/api/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Only superadmin can access forgot‑password flow
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role && role !== "superadmin") navigate("/");
  }, [navigate]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/forgot-password`, {
        email: trimmedEmail,
      });

      // Dev helper: show OTP in console when backend returns it in dev env
      if (res.data.otp) {
        console.log(`🔐 OTP for ${trimmedEmail} => ${res.data.otp}`);
      }

      localStorage.setItem("resetEmail", trimmedEmail);
      navigate("/verify-otp");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Something went wrong. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-background">
      <div className="auth-container">
        <div className="auth-box">
          <h2>Forgot Password</h2>
          <form onSubmit={handleSendOtp}>
            <label htmlFor="email">Registered Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              required
              aria-describedby="email-error"
            />
            {error && (
              <p id="email-error" className="error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" disabled={loading}>
              {loading ? "Sending…" : "Send OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
