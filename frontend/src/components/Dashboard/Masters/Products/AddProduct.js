import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { toast } from "react-toastify";
import BarcodeGenerator from "./BarcodeGenerator";
import axios from "axios";
import "./AddProduct.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

// -------------------- CONSTANTS --------------------
const HSN_REGEX = /^[A-Za-z0-9]{1,13}$/; // 1‒13 alphanumeric

export default function AddProduct({ products = [], setProducts = () => {} }) {
  /* -------------------------------------------------
     STATE
  ------------------------------------------------- */
  const [product, setProduct] = useState({
    category: "",
    productName: "",
    karat: "",
    weight: "",
    unit: "",
    stockQuantity: "",
    price: "",
    barcode: "",
    hsn: "", // 👈 NEW
  });

  const [autoGenerate, setAutoGenerate] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [errors, setErrors] = useState({});
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  /* -------------------------------------------------
     BARCODE SCANNER
  ------------------------------------------------- */
  useEffect(() => {
    if (scanning) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: 250 },
        false
      );

      scannerRef.current.render(
        async (decodedText) => {
          const trimmed = decodedText.trim();

          if (products.some((p) => p.barcode === trimmed)) {
            toast.error("Duplicate barcode scanned!");
            return;
          }

          try {
            const res = await axios.get(
              `${API_BASE}/api/products/barcode/${trimmed}`
            );

            const fetched = res.data;

            setProduct((prev) => ({
              ...prev,
              category: fetched.category || "",
              productName: fetched.product_name || "",
              karat: fetched.karat || "",
              weight: fetched.weight || "",
              unit: fetched.unit || "",
              stockQuantity: fetched.stock_quantity || "",
              price: fetched.price || "",
              barcode: fetched.barcode || "",
              hsn: fetched.hsn || "",
              barcodeImageBase64: "", // optional, will regenerate
            }));

            toast.success("Product details fetched from barcode ✅");
          } catch (err) {
            console.error("Barcode Fetch Error:", err);
            toast.warning("Barcode scanned, but no matching product found.");
            setProduct((prev) => ({ ...prev, barcode: trimmed }));
          }

          setErrors((prev) => ({ ...prev, barcode: "" }));
          setScanning(false);
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

  /* -------------------------------------------------
     INPUT HANDLER
  ------------------------------------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // simple numeric regex guards
    if (
      ["weight", "price"].includes(name) &&
      value !== "" &&
      !/^\d*\.?\d*$/.test(value)
    )
      return;
    if (name === "stockQuantity" && value !== "" && !/^\d*$/.test(value))
      return;

    setProduct((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /* -------------------------------------------------
     VALIDATION
  ------------------------------------------------- */
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
      hsn,
    } = product;

    if (!category.trim()) newErr.category = "Category is required.";
    if (!productName.trim()) newErr.productName = "Product name is required.";
    if (!karat.trim()) newErr.karat = "Karat is required.";
    if (!weight.trim() || Number(weight) <= 0)
      newErr.weight = "Invalid weight.";
    if (!unit.trim()) newErr.unit = "Unit is required.";
    if (
      stockQuantity === "" ||
      Number(stockQuantity) < 0 ||
      !Number.isInteger(Number(stockQuantity))
    )
      newErr.stockQuantity = "Invalid stock quantity.";
    if (price === "" || Number(price) < 0) newErr.price = "Invalid price.";

    // HSN validation
    if (!hsn.trim()) newErr.hsn = "HSN is required.";
    else if (!HSN_REGEX.test(hsn.trim())) newErr.hsn = "HSN 1-13 alphanumeric";
    else if (products.some((p) => p.hsn === hsn.trim()))
      newErr.hsn = "Duplicate HSN!";

    // Barcode validation
    if (!barcode.trim()) newErr.barcode = "Barcode is required.";
    else if (barcode.trim().length > 13)
      newErr.barcode = "Max 13 characters allowed.";
    else if (products.some((p) => p.barcode === barcode.trim()))
      newErr.barcode = "Duplicate barcode!";

    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  /* -------------------------------------------------
     SUBMIT
  ------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix errors before submitting.");
      return;
    }

    const payload = {
      category: product.category,
      productName: product.productName,
      karat: product.karat,
      weight: Number(product.weight || 0),
      unit: product.unit.trim() || "gm",
      stockQuantity: Number(product.stockQuantity || 0),
      price: Number(product.price || 0),
      barcode: product.barcode.trim(),
      hsn: product.hsn.trim(),
      barcodeImageBase64: product.barcodeImageBase64,
    };

    try {
      await axios.post(`${API_BASE}/api/products/add`, payload);
      console.log("Payload:", payload);
      toast.success("Product added successfully 🎉");
      setProducts((prev) => [...prev, { ...payload, source: "backend" }]);
      setProduct({
        category: "",
        productName: "",
        karat: "",
        weight: "",
        unit: "",
        stockQuantity: "",
        price: "",
        barcode: "",
        hsn: "", // reset
      });
      navigate("/dashboard/masters/products");
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || "Server error";
      if (status === 409) toast.error(msg);
      else toast.error(`Add failed: ${msg}`);
      console.error("API Error:", err);
    }
  };

  /* -------------------------------------------------
     MODE SWITCH (scanner / manual)
  ------------------------------------------------- */

  const setBarcodeMode = (mode) => {
    setScanning(false);
    setManualEntry(mode === "manual");
    setAutoGenerate(mode === "auto");

    if (mode === "auto") {
      const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000); // 10 digits
      const newCode = "BAR" + randomDigits; // Total 13 chars
      setProduct((prev) => ({
        ...prev,
        barcode: newCode,
        barcodeImageBase64: "", // reset image
      }));
    } else {
      setProduct((prev) => ({ ...prev, barcode: "", barcodeImageBase64: "" }));
    }

    setErrors((prev) => ({ ...prev, barcode: "" }));
  };

  /* -------------------------------------------------
     RENDER
  ------------------------------------------------- */
  return (
    <>
      {/* Back Button */}
      <div>
        <button
          style={buttonBack}
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
            { name: "hsn", label: "HSN Number", maxLength: 13 }, // 👈 NEW
          ].map(({ name, label, type = "text", inputMode, maxLength }) => (
            <div key={name}>
              <input
                type={type}
                name={name}
                placeholder={label}
                value={product[name]}
                onChange={handleChange}
                inputMode={inputMode}
                maxLength={maxLength}
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

          {/* Barcode Field + Barcode Image */}
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
              maxLength={13}
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

            {/* Show Barcode Image When Available */}
            {product.barcode.trim() && (
              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <BarcodeGenerator
                  value={product.barcode.trim()}
                  onBase64Ready={(base64) =>
                    setProduct((prev) => ({
                      ...prev,
                      barcodeImageBase64: base64,
                    }))
                  }
                />
                {/* 👇 ADD THIS LOADER BELOW */}
                {!product.barcodeImageBase64 && (
                  <small
                    style={{ color: "#555", display: "block", marginTop: 10 }}
                  >
                    Generating barcode image...
                  </small>
                )}
              </div>
            )}
          </div>
          {/* Barcode Mode Selection */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ marginRight: 15 }}>
              <input
                type="radio"
                name="barcodeMode"
                value="scanner"
                checked={!manualEntry && !autoGenerate}
                onChange={() => setBarcodeMode("scanner")}
                disabled={scanning}
              />{" "}
              Scan Barcode
            </label>

            <label style={{ marginRight: 15 }}>
              <input
                type="radio"
                name="barcodeMode"
                value="manual"
                checked={manualEntry}
                onChange={() => setBarcodeMode("manual")}
                disabled={scanning}
              />{" "}
              Manual Entry
            </label>

            <label>
              <input
                type="radio"
                name="barcodeMode"
                value="auto"
                checked={autoGenerate}
                onChange={() => setBarcodeMode("auto")}
                disabled={scanning}
              />{" "}
              Auto Generate
            </label>
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
}

/* -------------------- STYLES -------------------- */
const buttonBack = {
  backgroundColor: "#28a745",
  color: "#fff",
  border: "none",
  padding: "8px 16px",
  borderRadius: "4px",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 2px 4px rgba(0,0,0,0.12)",
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
