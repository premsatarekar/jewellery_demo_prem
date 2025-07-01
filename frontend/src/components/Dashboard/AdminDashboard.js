import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import InventoryTable from "../Dashboard/InventoryTable";
import { useUser } from "../../context/UserContext";
import { useCategory } from "./Masters/Categories/CategoryContext";
import "./AdminDashboard.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loadingUser } = useUser();
  const { categories = [], updateCategoryPrices, loading } = useCategory();

  const [basePrices, setBasePrices] = useState({});
  const [localCategories, setLocalCategories] = useState([]);
  const [updatingIds, setUpdatingIds] = useState(new Set());

  const [counts, setCounts] = useState({
    products: 0,
    vendors: 0,
    customers: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [prodRes, vendRes, custRes] = await Promise.all([
          fetch(`${API_BASE}/api/products`),
          fetch(`${API_BASE}/api/vendors`),
          fetch(`${API_BASE}/api/customers`),
        ]);

        const responses = [prodRes, vendRes, custRes];

        for (const res of responses) {
          const contentType = res.headers.get("content-type") || "";
          if (!contentType.includes("application/json")) {
            const text = await res.text();
            console.error("Invalid response:", text);
            throw new Error("Received HTML instead of JSON.");
          }
        }

        const [products, vendors, customers] = await Promise.all([
          prodRes.json(),
          vendRes.json(),
          custRes.json(),
        ]);

        setCounts({
          products: products.length,
          vendors: vendors.length,
          customers: customers.length,
        });
      } catch (err) {
        console.error("❌ Failed to fetch dashboard counts", err);
        toast.error("Failed to fetch dashboard data");
      }
    };

    fetchCounts();
  }, []);

  const categoryGroups = {
    goldGroup: ["22k", "24k", "18k", "14k"],
    diamondGroup: ["diamond"],
    platinumGroup: ["platinum"],
  };

  const findGroup = (catName) => {
    const lower = catName.toLowerCase();
    for (const [g, arr] of Object.entries(categoryGroups))
      if (arr.includes(lower)) return g;
    return null;
  };

  const getCaratMultiplier = (caratName) => {
    const name = caratName.toLowerCase();
    if (name.includes("24")) return 1;
    if (name.includes("22")) return 0.916;
    if (name.includes("18")) return 0.75;
    if (name.includes("14")) return 0.585;
    return 1;
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ""));
    if (isNaN(num)) return "";
    return `₹ ${num.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const parseNumeric = (value) => {
    return value.replace(/[^0-9.]/g, "");
  };

  const handleChange = (name, val) => {
    const numeric = parseNumeric(val);
    if (!/^\d*\.?\d*$/.test(numeric)) return;

    setBasePrices((prev) => ({ ...prev, [name]: numeric }));

    const baseNum = parseFloat(numeric);
    const grpName = findGroup(name);
    const catsToUpdate = grpName
      ? localCategories.filter((c) =>
          categoryGroups[grpName].includes(c.name.toLowerCase())
        )
      : localCategories.filter((c) => c.name === name);

    const updatedCats = localCategories.map((cat) => {
      if (!catsToUpdate.find((c) => c.id === cat.id)) return cat;

      const updatedCarats = cat.carats.map((ct) => ({
        ...ct,
        price:
          !numeric || isNaN(baseNum)
            ? ""
            : +(baseNum * getCaratMultiplier(ct.name)).toFixed(2),
      }));
      return { ...cat, carats: updatedCarats };
    });

    setLocalCategories(updatedCats);
  };

  const handleUpdate = async (clickedCat) => {
    const baseStr = basePrices[clickedCat.name];
    const baseNum = parseFloat(baseStr);

    if (!baseStr || isNaN(baseNum) || baseNum <= 0) {
      toast.error("Please enter a valid base price");
      return;
    }
    if (updatingIds.has(clickedCat.id)) return;

    setUpdatingIds((prev) => new Set(prev).add(clickedCat.id));

    const grpName = findGroup(clickedCat.name);
    const catsToUpdate = grpName
      ? localCategories.filter((c) =>
          categoryGroups[grpName].includes(c.name.toLowerCase())
        )
      : [clickedCat];

    try {
      await Promise.all(
        catsToUpdate.map((cat) => updateCategoryPrices(cat.id, cat))
      );
      toast.success(`${clickedCat.name} prices updated!`);
    } catch (err) {
      console.error(err);
      toast.error("Error updating prices. Please try again.");
    }

    setUpdatingIds((prev) => {
      const s = new Set(prev);
      s.delete(clickedCat.id);
      return s;
    });
  };

  useEffect(() => {
    setLocalCategories(categories);

    const calculatedBasePrices = {};
    categories.forEach((cat) => {
      if (!cat.carats || cat.carats.length === 0) return;

      const firstCarat = cat.carats.find(
        (ct) => ct.price !== "" && !isNaN(ct.price)
      );
      if (!firstCarat) return;

      const multiplier = getCaratMultiplier(firstCarat.name);
      const base = +(Number(firstCarat.price) / multiplier).toFixed(2);
      calculatedBasePrices[cat.name] = String(base);
    });

    setBasePrices(calculatedBasePrices);
  }, [categories]);

  if (loadingUser) return null;

  const isSuperadmin = user?.role?.toLowerCase() === "superadmin";

  const dashboardStats = [
    {
      label: "Category",
      count: categories.length,
      color: "blue",
      icon: "📦",
      path: "/dashboard/masters/categories",
    },
    {
      label: "Products",
      count: counts.products,
      color: "green",
      icon: "🏷️",
      path: "/dashboard/masters/products",
    },
    {
      label: "Vendors",
      count: counts.vendors,
      color: "purple",
      icon: "🚚",
      path: "/dashboard/masters/vendors/list",
    },
    {
      label: "Customers",
      count: counts.customers,
      color: "red",
      icon: "👥",
      path: "/dashboard/masters/customers/list",
    },
  ];

  return (
    <div style={{ padding: "40px" }}>
      <h2>Admin Dashboard</h2>

      <div className="top-stats-grid">
        {dashboardStats.map((item, index) => (
          <div
            key={index}
            className={`stat-box ${item.color}`}
            onClick={() => navigate(item.path)}
          >
            <div className="stat-icon">{item.icon}</div>
            <div className="stat-label">{item.label}</div>
            <div className="stat-value">{item.count}</div>
          </div>
        ))}
      </div>

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

      {isSuperadmin && (
        <>
          <h3 style={{ marginTop: "30px" }}>Today's Prices</h3>

          <div className="category-card-container">
            {loading ? (
              <div className="loader">⏳ Loading categories...</div>
            ) : (
              localCategories.map((cat) => (
                <div
                  className={`category-card ${cat.name.toLowerCase()}`}
                  key={cat.id}
                >
                  <h4>{cat.name}</h4>
                  <input
                    type="text"
                    className="price-input"
                    placeholder="Enter base price"
                    value={formatCurrency(basePrices[cat.name] || "")}
                    onChange={(e) => handleChange(cat.name, e.target.value)}
                  />
                  <button
                    className="update-button"
                    onClick={() => handleUpdate(cat)}
                    disabled={updatingIds.has(cat.id)}
                  >
                    {updatingIds.has(cat.id) ? "Updating..." : "Update"}
                  </button>
                  <div className="carat-prices">
                    {(cat.carats || []).map((c, idx) => (
                      <p key={idx}>
                        {parseFloat(c.name)} Karat : ₹{" "}
                        {Number(c.price || 0).toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          <InventoryTable />
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
