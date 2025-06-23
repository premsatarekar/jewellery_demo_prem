import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import AddProduct from "./AddProduct";
import EditProduct from "./EditProduct";
import ProductList from "./ProductList";
import ProductExcel from "./ProductExcel";

const ProductsPage = () => {
  const [products, setProducts] = useState(() => {
    const added = JSON.parse(localStorage.getItem("addedProducts")) || [];
    const excel = JSON.parse(localStorage.getItem("excelProducts")) || [];
    return [...added, ...excel];
  });

  useEffect(() => {
    const addedProducts = products.filter((p) => p.source !== "excel");
    const excelProducts = products.filter((p) => p.source === "excel");
    localStorage.setItem("addedProducts", JSON.stringify(addedProducts));
    localStorage.setItem("excelProducts", JSON.stringify(excelProducts));
  }, [products]);

  return (
    <Routes>
      <Route
        path="/"
        element={<ProductList products={products} setProducts={setProducts} />}
      />
      <Route
        path="add"
        element={<AddProduct products={products} setProducts={setProducts} />}
      />
      <Route
        path="edit/:productId"
        element={<EditProduct products={products} setProducts={setProducts} />}
      />
      <Route
        path="excel-import"
        element={<ProductExcel products={products} setProducts={setProducts} />}
      />
    </Routes>
  );
};

export default ProductsPage;
