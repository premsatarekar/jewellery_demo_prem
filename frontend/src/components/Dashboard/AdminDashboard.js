import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useUser } from "../../context/UserContext"; // user auth ctx
import { useCategory } from "./Masters/Categories/CategoryContext"; // category ctx
import "./AdminDashboard.css"; // keep existing styles

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser(); // logged‑in user (role etc.)
  const { categories = [], updateCategoryPrices } = useCategory();

  const [basePrices, setBasePrices] = useState({}); // { Gold: '6500', … }
  const [updatingIds, setUpdatingIds] = useState(new Set()); // for UI disabling

  /* ---------- helpers ---------- */
  const categoryGroups = {
    goldGroup: ["22k", "24k"],
    diamondGroup: ["diamond"],
    platinumGroup: ["platinum"],
  };

  const findGroup = (catName) => {
    const lower = catName.toLowerCase();
    for (const [g, arr] of Object.entries(categoryGroups))
      if (arr.includes(lower)) return g;
    return null;
  };

  const getCaratWeight = (caratName) => {
    if (!caratName || typeof caratName !== "string") return 1; // 👈 safe fallback
    const match = caratName.match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : 1;
  };

  /* ---------- input change ---------- */
  const handleChange = (name, val) => {
    const clean = val.trim();
    if (!/^\d*\.?\d*$/.test(clean)) return; // block non‑numeric
    setBasePrices((prev) => ({ ...prev, [name]: clean }));

    // if input cleared → clear prices for that category immediately
    if (clean === "") {
      const cat = categories.find((c) => c.name === name);
      if (!cat) return;
      const cleared = cat.carats.map((c) => ({ ...c, price: "" }));
      updateCategoryPrices(cat.id, { ...cat, carats: cleared });
    }
  };

  /* ---------- update prices ---------- */
  const handleUpdate = async (clickedCat) => {
    const baseStr = basePrices[clickedCat.name];
    const baseNum = parseFloat(baseStr);

    if (!baseStr || isNaN(baseNum) || baseNum <= 0) {
      toast.error("Please enter a valid base price");
      return;
    }
    if (updatingIds.has(clickedCat.id)) return; // prevent double‑click

    // add to updating set
    setUpdatingIds((prev) => new Set(prev).add(clickedCat.id));

    // decide which categories to update based on group
    const grpName = findGroup(clickedCat.name);
    const catsToUpdate = grpName
      ? categories.filter((c) =>
          categoryGroups[grpName].includes(c.name.toLowerCase())
        )
      : [clickedCat];

    try {
      await Promise.all(
        catsToUpdate.map((cat) => {
          const newCarats = cat.carats.map((ct) => ({
            ...ct,
            price: +(baseNum * getCaratWeight(ct.name)).toFixed(2),
          }));
          return updateCategoryPrices(cat.id, { ...cat, carats: newCarats });
        })
      );
      toast.success(`${clickedCat.name} prices updated!`);
    } catch (err) {
      console.error(err);
      toast.error("Error updating prices. Please try again.");
    }

    // remove from updating set
    setUpdatingIds((prev) => {
      const s = new Set(prev);
      s.delete(clickedCat.id);
      return s;
    });
  };

  /* ---------- UI ---------- */
  return (
    <div style={{ padding: "40px" }}>
      <h2>Admin Dashboard</h2>

      {/* Quick actions visible to everyone */}
      <div className="quick-actions centered-actions">
        <button onClick={() => navigate("/dashboard/masters/products/add")}>
          ➕ Add
        </button>
        <button onClick={() => navigate("/dashboard/sales/list")}>
          📄 Sales
        </button>
        <button onClick={() => navigate("/dashboard/reports/sales")}>
          📊 Report
        </button>
      </div>

      {/* Price update section only for superadmin */}
      {user.role === "superadmin" && (
        <>
          <h3 style={{ marginTop: "30px" }}>Today's Prices</h3>

          <div className="category-card-container">
            {categories.map((cat) => (
              <div
                className={`category-card ${cat.name.toLowerCase()}`}
                key={cat.id}
              >
                <h4>{cat.name}</h4>

                <input
                  type="number"
                  className="price-input"
                  placeholder="Enter base price"
                  value={basePrices[cat.name] || ""}
                  onChange={(e) => handleChange(cat.name, e.target.value)}
                  min="0"
                  step="0.01"
                />

                <button
                  className="update-button"
                  onClick={() => handleUpdate(cat)}
                  disabled={updatingIds.has(cat.id)}
                >
                  {updatingIds.has(cat.id) ? "Updating..." : "Update"}
                </button>

                <div className="carat-prices">
                  {cat.carats.map((c, idx) => (
                    <p key={idx}>
                      {c.name}K: ₹
                      {typeof c.price === "number"
                        ? c.price.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })
                        : "0.00"}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
