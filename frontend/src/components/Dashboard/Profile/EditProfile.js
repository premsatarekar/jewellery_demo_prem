// src/components/Dashboard/Profile/EditProfile.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ProfilePages.css";

const API = "http://localhost:5000/api/profile";

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
    if (!formData.name.trim()) e.name = "Name required";
    if (!formData.email.trim()) e.email = "Email required";
    if (!formData.shop_name.trim()) e.shop_name = "Shop name required";
    if (!formData.mobile.trim()) e.mobile = "Mobile required";
    else if (!/^\d{10}$/.test(formData.mobile)) e.mobile = "10-digit mobile";
    if (!formData.gst_number.trim()) e.gst_number = "GST required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setFormData((p) => ({ ...p, image_url: reader.result }));
    reader.readAsDataURL(file);
  };

  if (formData.image_url && formData.image_url.length > 15000000) {
    alert("Image too large, please upload a smaller file (≤ 15 MB).");
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
        <div
          className="form-group"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            marginBottom: "20px",
          }}
        >
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
          ["Name", "name"],
          ["Email", "email"],
          ["Shop Name", "shop_name"],
          ["Shop Address", "shop_address"],
          ["Mobile", "mobile"],
          ["GST Number", "gst_number"],
        ].map(([label, key]) => (
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
              {label}:
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
