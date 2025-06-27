// src/components/Dashboard/Profile/ProfileSettings.js
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProfileSettings.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const API_PROFILE = `${API_BASE}/api/profile`;
const API_LOGOUT = `${API_BASE}/api/auth/logout`;

export default function ProfileSettings({ onLogout }) {
  /* ----------------------- local state ----------------------- */
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [profilePic, setProfilePic] = useState("/images/empty-avatar.png");

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  /* --------------------- fetch profile pic ------------------- */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(API_PROFILE);
        if (
          data?.image_url?.startsWith("http") ||
          data?.image_url?.startsWith("data:image/")
        ) {
          setProfilePic(data.image_url);
        }
      } catch (err) {
        console.error("FETCH PIC ERR:", err.message);
      }
    })();

    /* 👍 profile pic live update (EditProfile ke baad) */
    const cb = () => {
      axios.get(API_PROFILE).then(({ data }) => {
        if (data?.image_url) setProfilePic(data.image_url);
      });
    };
    window.addEventListener("profilePicUpdated", cb);
    return () => window.removeEventListener("profilePicUpdated", cb);
  }, []);

  /* ------------- close dropdown on outside click ------------- */
  useEffect(() => {
    const handleClick = (e) => {
      if (
        !dropdownRef.current?.contains(e.target) &&
        !buttonRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* -------------------- option click handler ----------------- */
  const handleOptionClick = async (opt) => {
    if (busy) return;
    setBusy(true);
    setOpen(false);

    try {
      if (opt === "view") {
        navigate("/dashboard/profile/view");
      } else if (opt === "edit") {
        navigate("/dashboard/profile/edit");
      } else if (opt === "logout") {
        /* current user ka detail bhej do (optional) */
        const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
        await axios
          .post(API_LOGOUT, {
            user_id: user.id,
            username: user.username,
            role: user.role,
          })
          .catch(() => {
            /* agar backend route na ho to ignore */
          });

        /** saari local storage saaf karo */
        localStorage.clear();
        if (typeof onLogout === "function") onLogout();

        /* login page pe redirect */
        navigate("/login", { replace: true });
      }
    } catch (err) {
      console.error("handleOptionClick ERR:", err.message);
    } finally {
      setTimeout(() => setBusy(false), 400);
    }
  };

  /* --------------------------- UI ---------------------------- */
  return (
    <div className="profile-settings">
      <button
        ref={buttonRef}
        className="profile-button"
        onClick={() => !busy && setOpen(!open)}
      >
        <img src={profilePic} alt="Profile" className="profile-icon" />
      </button>

      <div ref={dropdownRef} className={`dropdown-menu${open ? " show" : ""}`}>
        <div onClick={() => handleOptionClick("view")}>View Profile</div>
        <div onClick={() => handleOptionClick("edit")}>Edit Profile</div>
        <div onClick={() => handleOptionClick("logout")} className="logout">
          Logout
        </div>
      </div>
    </div>
  );
}
