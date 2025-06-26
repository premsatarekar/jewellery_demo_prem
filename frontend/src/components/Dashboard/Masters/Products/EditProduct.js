import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./EditProduct.css";
import BarcodeGenerator from "./BarcodeGenerator";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    productName: "",
    category: "",
    karat: "",
    unit: "gm",
    weight: "",
    barcode: "",
    hsn: "",
    stockQuantity: "",
    price: "",
  });

  const [errors, setErrors] = useState({});

  // ================= FETCH =================
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/products/${id}`)
      .then((res) => {
        const p = res.data;
        setProduct({
          productName: p.product_name || "",
          category: p.category || "",
          karat: p.karat || "",
          unit: p.unit || "gm",
          weight: p.weight || "",
          barcode: p.barcode || "",
          hsn: p.hsn || "",
          stockQuantity: p.stock_quantity || "",
          price: p.price || "",
        });

        // 🔥 FIRE PDF SAVE FOR BARCODE
        if (p.barcode) {
          axios
            .get(`http://localhost:5000/api/products/barcode/pdf/${p.barcode}`)
            .then(() => console.log("✅ Barcode PDF saved"))
            .catch((err) =>
              console.error("❌ Failed to save barcode PDF", err)
            );
        }
      })
      .catch(() => {
        alert("Product not found!");
        navigate("/dashboard/masters/products");
      });
  }, [id, navigate]);

  // ================= CHANGE HANDLER =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ================= VALIDATION =================
  const validate = () => {
    const newErrors = {};
    if (!product.productName.trim())
      newErrors.productName = "Product name is required.";
    if (!product.category.trim()) newErrors.category = "Category is required.";
    if (!product.karat.trim()) newErrors.karat = "Karat is required.";
    if (product.unit.toLowerCase() !== "gm")
      newErrors.unit = "Unit must be 'gm'.";
    if (!product.weight || isNaN(product.weight) || Number(product.weight) <= 0)
      newErrors.weight = "Weight must be a positive number.";
    if (
      product.stockQuantity === "" ||
      isNaN(product.stockQuantity) ||
      Number(product.stockQuantity) < 0
    )
      newErrors.stockQuantity = "Stock quantity must be 0 or more.";
    if (
      product.price === "" ||
      isNaN(product.price) ||
      Number(product.price) < 0
    )
      newErrors.price = "Price must be 0 or more.";
    if (!product.hsn.trim()) newErrors.hsn = "HSN missing.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ================= SAVE =================
  const handleSave = () => {
    if (!validate()) {
      alert("Please fix errors before saving.");
      return;
    }

    const payload = {
      productName: product.productName,
      category: product.category,
      karat: product.karat,
      unit: product.unit,
      weight: product.weight,
      stockQuantity: product.stockQuantity,
      price: product.price,
    };

    axios
      .put(`http://localhost:5000/api/products/${id}`, payload)
      .then(() => {
        alert("✅ Product updated successfully");
        navigate("/dashboard/masters/products");
      })
      .catch((err) => {
        console.error("Update error:", err);
        alert("Failed to update product");
      });
  };

  // ================= RENDER =================
  return (
    <div className="edit-container">
      <h2>Edit Product</h2>
      <div className="edit-form">
        {/* Editable Fields */}
        <label>Product Name</label>
        <input
          name="productName"
          value={product.productName}
          onChange={handleChange}
          placeholder="Enter product name"
        />
        {errors.productName && (
          <small className="error">{errors.productName}</small>
        )}

        <label>Category</label>
        <input
          name="category"
          value={product.category}
          onChange={handleChange}
          placeholder="Enter category"
        />
        {errors.category && <small className="error">{errors.category}</small>}

        <label>Carat</label>
        <input
          name="karat"
          value={product.karat}
          onChange={handleChange}
          placeholder="Enter karat"
        />
        {errors.karat && <small className="error">{errors.karat}</small>}

        <label>Unit</label>
        <input
          name="unit"
          value={product.unit}
          readOnly
          className="read-only-input"
        />
        {errors.unit && <small className="error">{errors.unit}</small>}

        <label>Weight (gm)</label>
        <input
          name="weight"
          type="number"
          value={product.weight}
          onChange={handleChange}
          placeholder="Enter weight"
        />
        {errors.weight && <small className="error">{errors.weight}</small>}

        <label>Stock Quantity</label>
        <input
          name="stockQuantity"
          type="number"
          value={product.stockQuantity}
          onChange={handleChange}
          placeholder="Enter stock quantity"
        />
        {errors.stockQuantity && (
          <small className="error">{errors.stockQuantity}</small>
        )}

        <label>Price (₹)</label>
        <input
          name="price"
          type="number"
          value={product.price}
          onChange={handleChange}
          placeholder="Enter price"
        />
        {errors.price && <small className="error">{errors.price}</small>}

        {/* Read-only Fields */}
        <label>Barcode</label>
        <input
          name="barcode"
          value={product.barcode}
          readOnly
          className="read-only-input"
        />

        {/* Barcode Image + Buttons */}
        {product.barcode && (
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <h4 style={{ color: "#888", marginBottom: "10px" }}>
              Barcode is auto-generated and cannot be changed
            </h4>
            <BarcodeGenerator
              value={product.barcode}
              productName={product.productName}
              price={product.price}
            />
          </div>
        )}

        <label>HSN</label>
        <input
          name="hsn"
          value={product.hsn}
          readOnly
          className="read-only-input"
        />
        {errors.hsn && <small className="error">{errors.hsn}</small>}

        <button onClick={handleSave} className="save-btn">
          Save
        </button>
      </div>
    </div>
  );
}
