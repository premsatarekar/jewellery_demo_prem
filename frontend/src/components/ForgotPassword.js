import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AuthForm.css"; // reuse same styles

const API_BASE = process.env.REACT_APP_API_BASE_URL + "/api/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const navigate = useNavigate();

  // ✅ Only superadmin can reset
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role && role !== "superadmin") navigate("/");
  }, [navigate]);

  // ⏱️ Timer logic for resend button
  useEffect(() => {
    let interval;
    if (otpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, resendTimer]);

  // 🔁 Send OTP logic
  const sendOtp = async (emailToSend) => {
    const res = await axios.post(`${API_BASE}/forgot-password`, {
      email: emailToSend,
    });

    if (res.data.otp) {
      console.log(`🔐 OTP for ${emailToSend} => ${res.data.otp}`);
    }

    localStorage.setItem("resetEmail", emailToSend);
    setOtpSent(true);
    setResendTimer(60); // reset timer
  };

  // 📤 Submit handler with validation
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Optional: allow only Gmail
    // if (!trimmedEmail.endsWith("@gmail.com")) {
    //   setError("Only @gmail.com email addresses are allowed.");
    //   return;
    // }

    try {
      setLoading(true);
      await sendOtp(trimmedEmail);
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
              onBlur={() => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (email && !emailRegex.test(email)) {
                  setError("Please enter a valid email address.");
                }
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

          {otpSent && (
            <button
              type="button"
              onClick={() => sendOtp(email)}
              disabled={resendTimer > 0}
              className="resend-btn"
            >
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
