import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AuthForm.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL + "/api/auth";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("resetEmail");

    if (!email) {
      navigate("/forgot-password"); // koi session nahi, toh back to start
    }
  }, [navigate]);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError("Please fill in both fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const email = localStorage.getItem("resetEmail");
    if (!email) {
      setError("Session expired. Please restart password reset.");
      navigate("/forgot-password");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_BASE}/reset-password`, {
        email,
        newPassword: password,
      });

      // Cleanup
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("otp");
      localStorage.removeItem("otpGeneratedAt");

      setPassword("");
      setConfirmPassword("");
      setError("");

      alert("✅ Password has been reset. Please log in.");
      navigate("/login", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-background">
      <div className="auth-container">
        <div className="auth-box">
          <h2>Reset Password</h2>

          <form onSubmit={handleReset}>
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              minLength={6}
              required
              autoComplete="new-password"
            />

            <label htmlFor="confirmPassword" style={{ marginTop: "1rem" }}>
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError("");
              }}
              minLength={6}
              required
              autoComplete="new-password"
            />

            {error && (
              <p className="error" role="alert" style={{ marginTop: "0.5rem" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              style={{ marginTop: "1rem" }}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
