import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./AuthForm.css";
import API from "../api"; 


export default function AuthForm({ onLogin }) {
  const navigate = useNavigate();

  /* ----------------------------- local state ----------------------------- */
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "superadmin",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* ----------------------------- handlers ------------------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please correct the form errors.");
      return;
    }

    const { username, password, role } = formData;
    try {
      setLoading(true);
      const res = await API.post("/auth/login", {
        username,
        password,
        role,
      });

      // ✅ success – backend returns { token, user }
      const { token, user } = res.data;
      toast.success(
        `${role === "staff" ? "Staff" : "Superadmin"} login successful!`
      );

      // Persist session
      localStorage.setItem("token", token);
      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.setItem("role", role);
      localStorage.setItem("isLoggedIn", "true");

      // Call onLogin only if provided
      if (typeof onLogin === "function") onLogin();

      window.location.href = "/dashboard/admin-dashboard";
    } catch (err) {
      console.error("Login error", err);
      const message =
        err.response?.data?.message || err.message || "Invalid credentials.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  /* ----------------------------- UI ------------------------------------ */
  return (
    <div className="auth-background">
      <div className="auth-container">
        <img src="/images/logoo.png" alt="App Logo" className="auth-logo" />
        <div className="auth-box">
          <h2>Login</h2>
          <form onSubmit={handleSubmit} noValidate>
            <input
              type="text"
              name="username"
              placeholder="Username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && <p className="error">{errors.username}</p>}

            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "👁️" : "🙈"}
              </span>
            </div>
            {errors.password && <p className="error">{errors.password}</p>}

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="role-select"
            >
              <option value="superadmin">Superadmin</option>
              <option value="staff">Staff</option>
            </select>

            <button type="submit" disabled={loading}>
              {loading ? "Logging in…" : "Login"}
            </button>
          </form>

          {formData.role === "superadmin" && (
            <p>
              <button className="forgot-btn" onClick={handleForgotPassword}>
                Forgot Password?
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
