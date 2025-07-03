// src/components/Dashboard/Profile/EditProfile.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ProfilePages.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL;
const API = `${API_BASE}/api/profile`;

const EditProfile = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    image_url: "",
    shop_name: "",
    shop_address: "",
    mobile: "",
    gst_number: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(API);
        setFormData(data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.msg || "Unable to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const validate = () => {
    const e = {};

    const trimmedName = formData.name.trim();
    if (!/^[A-Za-z ]{3,15}$/.test(trimmedName)) {
      e.name =
        "Name must be 3-15 letters only (no digits or special characters)";
    }

    if (!formData.email.trim()) e.email = "Email required";
    else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(formData.email.trim())) {
      e.email = "Email must be valid and end with @gmail.com";
    }

    const shopName = formData.shop_name.trim();
    if (shopName.length < 15 || shopName.length > 25) {
      e.shop_name = "Shop name must be between 15-25 characters";
    }

    if (!/^[1-9][0-9]{9}$/.test(formData.mobile.trim())) {
      e.mobile = "Mobile must be exactly 10 digits and not start with 0";
    }

    if (!/^[A-Za-z0-9]{15}$/.test(formData.gst_number.trim())) {
      e.gst_number = "GST must be 15 alphanumeric characters only";
    }

    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setFormData((prev) => ({ ...prev, image_url: reader.result }));
    reader.readAsDataURL(file);
  };

  if (formData.image_url && formData.image_url.length > 15000000) {
    alert("Image too large, please upload a smaller file (\u2264 15 MB).");
    return;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await axios.put(API, formData);
      alert("Profile updated ✔️");
      window.dispatchEvent(new Event("profilePicUpdated"));
      navigate("/dashboard/profile/view");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Server error");
    }
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading...</p>;
  if (error) return <p style={{ padding: "20px", color: "red" }}>{error}</p>;

  return (
    <div className="profile-page">
      <h2 className="section-title">Edit Profile</h2>
      <form
        className="edit-form"
        onSubmit={handleSubmit}
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "20px",
          background: "#fff",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label style={{ fontWeight: "bold" }}>Profile Picture:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ marginBottom: "10px" }}
          />
          {formData.image_url && (
            <img
              src={formData.image_url}
              alt="Preview"
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #ccc",
              }}
            />
          )}
        </div>

        {[
          "name",
          "email",
          "shop_name",
          "shop_address",
          "mobile",
          "gst_number",
        ].map((key) => (
          <div
            className="form-group"
            key={key}
            style={{ marginBottom: "15px" }}
          >
            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              {key.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}:
            </label>
            <input
              type="text"
              name={key}
              value={formData[key] || ""}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            {errors[key] && (
              <span
                className="error-text"
                style={{ color: "red", fontSize: "0.9rem" }}
              >
                {errors[key]}
              </span>
            )}
          </div>
        ))}

        <button
          type="submit"
          className="save-btn"
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
