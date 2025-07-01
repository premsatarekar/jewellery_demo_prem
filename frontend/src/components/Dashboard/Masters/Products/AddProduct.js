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
    hsn: "",
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
              barcodeImageBase64: "",
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

    if (!hsn.trim()) newErr.hsn = "HSN is required.";
    else if (!HSN_REGEX.test(hsn.trim())) newErr.hsn = "HSN 1-13 alphanumeric";
    else if (products.some((p) => p.hsn === hsn.trim()))
      newErr.hsn = "Duplicate HSN!";

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
        hsn: "",
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
      const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
      const newCode = "BAR" + randomDigits;
      setProduct((prev) => ({
        ...prev,
        barcode: newCode,
        barcodeImageBase64: "",
      }));
    } else {
      setProduct((prev) => ({ ...prev, barcode: "", barcodeImageBase64: "" }));
    }

    setErrors((prev) => ({ ...prev, barcode: "" }));
  };

  return (
    <div className="add-product-container">
      {/* Header Card */}
      <div className="header-card">
        <div className="header-content">
          <h2>Add New Product</h2>
          <button
            className="back-button"
            onClick={() => navigate("/dashboard/masters/products")}
          >
            Product List
          </button>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit} noValidate>
          {/* First Row */}
          <div className="form-row">
            <div className="input-group">
              <label>Category</label>
              <input
                type="text"
                name="category"
                value={product.category}
                onChange={handleChange}
                className={errors.category ? "error" : ""}
              />
              {errors.category && (
                <div className="error-text">{errors.category}</div>
              )}
            </div>

            <div className="input-group">
              <label>Product Name</label>
              <input
                type="text"
                name="productName"
                value={product.productName}
                onChange={handleChange}
                className={errors.productName ? "error" : ""}
              />
              {errors.productName && (
                <div className="error-text">{errors.productName}</div>
              )}
            </div>

            <div className="input-group">
              <label>Karat</label>
              <input
                type="text"
                name="karat"
                value={product.karat}
                onChange={handleChange}
                className={errors.karat ? "error" : ""}
              />
              {errors.karat && <div className="error-text">{errors.karat}</div>}
            </div>

            <div className="input-group">
              <label>Weight</label>
              <input
                type="text"
                name="weight"
                inputMode="decimal"
                value={product.weight}
                onChange={handleChange}
                className={errors.weight ? "error" : ""}
              />
              {errors.weight && (
                <div className="error-text">{errors.weight}</div>
              )}
            </div>
          </div>

          {/* Second Row */}
          <div className="form-row">
            <div className="input-group">
              <label>Unit</label>
              <input
                type="text"
                name="unit"
                value={product.unit}
                onChange={handleChange}
                className={errors.unit ? "error" : ""}
              />
              {errors.unit && <div className="error-text">{errors.unit}</div>}
            </div>

            <div className="input-group">
              <label>Stock Quantity</label>
              <input
                type="number"
                name="stockQuantity"
                value={product.stockQuantity}
                onChange={handleChange}
                className={errors.stockQuantity ? "error" : ""}
              />
              {errors.stockQuantity && (
                <div className="error-text">{errors.stockQuantity}</div>
              )}
            </div>

            <div className="input-group">
              <label>Price</label>
              <input
                type="number"
                name="price"
                value={product.price}
                onChange={handleChange}
                className={errors.price ? "error" : ""}
              />
              {errors.price && <div className="error-text">{errors.price}</div>}
            </div>

            <div className="input-group">
              <label>HSN Number</label>
              <input
                type="text"
                name="hsn"
                value={product.hsn}
                onChange={handleChange}
                maxLength={13}
                className={errors.hsn ? "error" : ""}
              />
              {errors.hsn && <div className="error-text">{errors.hsn}</div>}
            </div>
          </div>

          {/* Barcode Section */}
          <div className="barcode-section">
            <div className="barcode-controls">
              <div className="barcode-input-group">
                <label>Barcode</label>
                <input
                  type="text"
                  name="barcode"
                  placeholder="Scan or enter barcode"
                  value={product.barcode}
                  onChange={handleChange}
                  disabled={scanning || autoGenerate}
                  maxLength={13}
                  className={errors.barcode ? "error" : ""}
                />
                {errors.barcode && (
                  <div className="error-text">{errors.barcode}</div>
                )}
              </div>

              <div className="barcode-options">
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="barcodeMode"
                      value="scanner"
                      checked={!manualEntry && !autoGenerate}
                      onChange={() => setBarcodeMode("scanner")}
                      disabled={scanning}
                    />
                    <span>Scan Barcode</span>
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="barcodeMode"
                      value="manual"
                      checked={manualEntry}
                      onChange={() => setBarcodeMode("manual")}
                      disabled={scanning}
                    />
                    <span>Manual Entry</span>
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="barcodeMode"
                      value="auto"
                      checked={autoGenerate}
                      onChange={() => setBarcodeMode("auto")}
                      disabled={scanning}
                    />
                    <span>Auto Generate</span>
                  </label>
                </div>

                {!scanning && !manualEntry && (
                  <button
                    type="button"
                    onClick={() => setScanning(true)}
                    className="scan-button"
                  >
                    Start Scan
                  </button>
                )}
              </div>
            </div>

            {scanning && <div id="reader" className="scanner-container"></div>}

            {product.barcode.trim() && (
              <div className="barcode-preview">
                <BarcodeGenerator
                  value={product.barcode.trim()}
                  onBase64Ready={(base64) =>
                    setProduct((prev) => ({
                      ...prev,
                      barcodeImageBase64: base64,
                    }))
                  }
                />
                {!product.barcodeImageBase64 && (
                  <div className="barcode-loading">
                    Generating barcode image...
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="submit-section">
            <button type="submit" className="submit-button">
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
