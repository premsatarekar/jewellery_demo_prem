// src/components/AddProduct.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { toast } from "react-toastify";
import axios from "axios";
import "./AddProduct.css";

const AddProduct = ({ products = [], setProducts = () => {} }) => {
  const [product, setProduct] = useState({
    category: "",
    productName: "",
    karat: "",
    weight: "",
    unit: "",
    stockQuantity: "",
    price: "",
    barcode: "",
  });

  const [scanning, setScanning] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [errors, setErrors] = useState({});
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  /* ------------ Barcode scanner logic ------------ */
  useEffect(() => {
    if (scanning) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: 250 },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          const trimmed = decodedText.trim();
          if (products.some((p) => p.barcode === trimmed)) {
            toast.error("Duplicate barcode scanned!");
          } else {
            setProduct((prev) => ({ ...prev, barcode: trimmed }));
            setErrors((prev) => ({ ...prev, barcode: "" }));
            toast.success("Barcode scanned!");
            setScanning(false);
          }
        },
        () => {}
      );
    }

    return () => {
      if (scannerRef.current?.clear) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [scanning, products]);

  /* ------------ Helpers ------------ */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // numeric validation
    if (
      ["weight", "price"].includes(name) &&
      value !== "" &&
      !/^\d*\.?\d*$/.test(value)
    )
      return;
    if (name === "stockQuantity" && value !== "" && !/^\d*$/.test(value)) return;

    setProduct((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErr = {};
    const {
      category,
      productName,
      karat,
      weight,
      unit,
      stockQuantity,
      price,
      barcode,
    } = product;

    if (!category.trim()) newErr.category = "Category is required.";
    if (!productName.trim()) newErr.productName = "Product name is required.";
    if (!karat.trim()) newErr.karat = "Karat is required.";
    if (!weight.trim() || Number(weight) <= 0) newErr.weight = "Invalid weight.";
    if (!unit.trim()) newErr.unit = "Unit is required.";
    if (
      stockQuantity === "" ||
      Number(stockQuantity) < 0 ||
      !Number.isInteger(Number(stockQuantity))
    )
      newErr.stockQuantity = "Invalid stock quantity.";
    if (price === "" || Number(price) < 0) newErr.price = "Invalid price.";
    if (!barcode.trim()) {
      newErr.barcode = "Barcode is required.";
    } else if (products.some((p) => p.barcode === barcode.trim())) {
      newErr.barcode = "Duplicate barcode!";
    }

    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  /* ------------ Submit ------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix errors before submitting.");
      return;
    }

    const payload = {
      ...product,
      weight: Number(product.weight || 0),
      stockQuantity: Number(product.stockQuantity || 0),
      price: Number(product.price || 0),
      barcode: product.barcode.trim(),
      unit: product.unit.trim() || "gm",
    };

    try {
      await axios.post("/api/products/add", payload); // baseURL handled via proxy or axios.defaults
      toast.success("Product added successfully 🎉");
      setProducts((prev) => [...prev, payload]); // local update optional
      setProduct({
        category: "",
        productName: "",
        karat: "",
        weight: "",
        unit: "",
        stockQuantity: "",
        price: "",
        barcode: "",
      });
      navigate("/dashboard/masters/products");
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || "Server error";
      if (status === 409) {
        toast.error("Barcode already exists — use another.");
      } else if (status === 400) {
        toast.error(msg);
      } else {
        toast.error(`Add failed: ${msg}`);
      }
      console.error("API Error:", err);
    }
  };

  const setMode = (mode) => {
    setManualEntry(mode === "manual");
    setScanning(false);
    setProduct((prev) => ({ ...prev, barcode: "" }));
    setErrors((prev) => ({ ...prev, barcode: "" }));
  };

  /* ------------ JSX ------------ */
  return (
    <>
      <div>
        <button
          style={{
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.12)",
          }}
          onClick={() => navigate("/dashboard/masters/products")}
        >
          Product List
        </button>
      </div>

      <br />
      <br />

      <div style={styles.container}>
        <h2>Add Product</h2>
        <form onSubmit={handleSubmit} noValidate>
          {[
            { name: "category", label: "Category" },
            { name: "productName", label: "Product Name" },
            { name: "karat", label: "Karat" },
            { name: "weight", label: "Weight", inputMode: "decimal" },
            { name: "unit", label: "Unit" },
            { name: "stockQuantity", label: "Stock Quantity", type: "number" },
            { name: "price", label: "Price", type: "number" },
          ].map(({ name, label, type = "text", inputMode }) => (
            <div key={name}>
              <input
                type={type}
                name={name}
                placeholder={label}
                value={product[name]}
                onChange={handleChange}
                inputMode={inputMode}
                style={{
                  width: "100%",
                  padding: 8,
                  marginBottom: 10,
                  borderColor: errors[name] ? "red" : "#ccc",
                }}
              />
              {errors[name] && (
                <small style={{ color: "red" }}>{errors[name]}</small>
              )}
            </div>
          ))}

          {/* Barcode */}
          <div>
            <label>
              <strong>Barcode:</strong>
            </label>
            <input
              type="text"
              name="barcode"
              placeholder="Scan or enter barcode"
              value={product.barcode}
              onChange={handleChange}
              disabled={scanning}
              style={{
                width: "100%",
                padding: 8,
                marginBottom: 10,
                borderColor: errors.barcode ? "red" : "#ccc",
              }}
            />
            {errors.barcode && (
              <small style={{ color: "red" }}>{errors.barcode}</small>
            )}
          </div>

          <div style={{ marginBottom: 10 }}>
            <button
              type="button"
              onClick={() => setMode("scanner")}
              className={`toggle-btn ${!manualEntry ? "active" : ""}`}
              disabled={scanning}
            >
              Scan Barcode
            </button>
            <button
              type="button"
              onClick={() => setMode("manual")}
              className={`toggle-btn ${manualEntry ? "active" : ""}`}
              disabled={scanning}
            >
              Manual Entry
            </button>
          </div>

          {scanning && (
            <div
              id="reader"
              style={{ width: 300, margin: "auto", marginBottom: 20 }}
            />
          )}

          {!scanning && !manualEntry && (
            <button
              type="button"
              onClick={() => setScanning(true)}
              style={styles.scanBtn}
            >
              Start Scan
            </button>
          )}

          <button type="submit" style={styles.submitBtn}>
            Add Product
          </button>
        </form>
      </div>
    </>
  );
};

const styles = {
  container: {
    maxWidth: 400,
    margin: "30px auto",
    padding: 20,
    border: "1px solid #ccc",
    borderRadius: 8,
  },
  scanBtn: {
    padding: "10px 20px",
    marginBottom: 10,
    backgroundColor: "#007bff",
    border: "none",
    color: "white",
    borderRadius: 4,
    cursor: "pointer",
    width: "100%",
    fontSize: 16,
  },
  submitBtn: {
    padding: "10px 20px",
    backgroundColor: "green",
    border: "none",
    borderRadius: 4,
    color: "white",
    cursor: "pointer",
    width: "100%",
    fontSize: 16,
  },
};

export default AddProduct;
