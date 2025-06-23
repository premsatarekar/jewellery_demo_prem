import React from "react";
import "./ProfilePages.css";

const AccountSettings = () => {
  return (
    <div className="profile-page">
      <h2>Account Settings</h2>
      <ul>
        <li>Change Password</li>
        <li>Manage Notifications</li>
        <li>Set Business Hours</li>
        <li>Backup Inventory</li>
        <li>Set GST & Tax Preferences</li>
        <li>Enable/Disable Vendor Accounts</li>
      </ul>
    </div>
  );
};

export default AccountSettings;
