// src/components/Dashboard/Profile/ViewProfile.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProfilePages.css";

const API = process.env.REACT_APP_API_BASE_URL + "/api/profile";

const ViewProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(API);
        setUser(data);
      } catch (err) {
        console.error("FETCH PROFILE ERR", err);
        setError(err.response?.data?.msg || "Unable to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-danger">{error}</p>;
  if (!user) return <p className="p-4">No profile found.</p>;

  const profileImage = user.image_url?.trim()
    ? user.image_url
    : "/images/empty-avatar.png";

  // Validations on display
  const isValidName = /^[A-Za-z ]{3,15}$/.test(user.name || "");
  const isValidEmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(user.email || "");
  const isValidShopName =
    typeof user.shop_name === "string" &&
    user.shop_name.trim().length >= 15 &&
    user.shop_name.trim().length <= 25;
  const isValidMobile = /^[1-9][0-9]{9}$/.test(user.mobile || "");
  const isValidGst = /^[A-Za-z0-9]{15}$/.test(user.gst_number || "");

  return (
    <div className="profile-page">
      <h2 className="section-title">Admin Profile</h2>

      <div className="profile-card compact">
        <img src={profileImage} alt="Profile" className="profile-img-compact" />
        <div className="profile-info">
          <h3 className="admin-name">
            {isValidName ? user.name : "Invalid Name"}
          </h3>
          <p className="admin-email">
            {isValidEmail ? user.email : "Invalid Email"}
          </p>
        </div>
      </div>

      <div className="details-section">
        <h3 className="section-subtitle">Shop Information</h3>

        <div className="detail-row">
          <span className="label">Shop Name:</span>
          <span className="value">
            {isValidShopName ? user.shop_name : "Invalid Shop Name"}
          </span>
        </div>

        <div className="detail-row">
          <span className="label">Address:</span>
          <span className="value">{user.shop_address || "-"}</span>
        </div>

        <div className="detail-row">
          <span className="label">Mobile:</span>
          <span className="value">
            {isValidMobile ? user.mobile : "Invalid Mobile"}
          </span>
        </div>

        <div className="detail-row">
          <span className="label">GST Number:</span>
          <span className="value">
            {isValidGst ? user.gst_number : "Invalid GST"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
