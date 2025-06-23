// src/components/Dashboard/Profile/ViewProfile.js (backend‑connected)
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProfilePages.css";

const API = "http://localhost:5000/api/profile"; // backend base

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

  return (
    <div className="profile-page">
      <h2 className="section-title">Admin Profile</h2>

      <div className="profile-card compact">
        <img src={profileImage} alt="Profile" className="profile-img-compact" />
        <div className="profile-info">
          <h3 className="admin-name">{user.name}</h3>
          <p className="admin-email">{user.email}</p>
        </div>
      </div>

      <div className="details-section">
        <h3 className="section-subtitle">Shop Information</h3>
        <div className="detail-row">
          <span className="label">Shop Name:</span>
          <span className="value">{user.shop_name || "-"}</span>
        </div>
        <div className="detail-row">
          <span className="label">Address:</span>
          <span className="value">{user.shop_address || "-"}</span>
        </div>
        <div className="detail-row">
          <span className="label">Mobile:</span>
          <span className="value">{user.mobile || "-"}</span>
        </div>
        <div className="detail-row">
          <span className="label">GST Number:</span>
          <span className="value">{user.gst_number || "-"}</span>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
