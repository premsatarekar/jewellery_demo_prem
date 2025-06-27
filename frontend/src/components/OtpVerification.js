import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AuthForm.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL + "/api/auth";

export default function OtpVerification() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* ----------------------------- guards ----------------------------- */
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role && role !== "superadmin") navigate("/");

    if (!localStorage.getItem("resetEmail")) {
      setError("No reset session found. Please try again.");
    }
  }, [navigate]);

  /* ----------------------------- verify OTP ------------------------- */
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError("Please enter OTP");
      return;
    }

    try {
      setLoading(true);
      const email = localStorage.getItem("resetEmail");
      await axios.post(`${API_BASE}/verify-otp`, { email, otp: otp.trim() });

      // success
      setError("");
      navigate("/reset-password");
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid OTP";
      setError(msg);
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------- UI --------------------------------- */
  return (
    <div className="auth-background">
      <div className="auth-container">
        <div className="auth-box">
          <h2>Verify OTP</h2>
          <p
            style={{
              textAlign: "center",
              color: "#764ba2",
              marginBottom: "1rem",
            }}
          >
            We've sent a 6‑digit OTP to your registered email address.
          </p>

          <form onSubmit={handleVerify}>
            <label htmlFor="otp">Enter OTP</label>
            <input
              id="otp"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                if (error) setError("");
              }}
              maxLength={6}
              required
              autoComplete="off"
              style={{
                textAlign: "center",
                letterSpacing: "0.3em",
                fontSize: "1.25rem",
              }}
            />

            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Verifying…" : "Verify"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
