// backend/routes/products.js
import express from "express";
import {
  addProduct,
  bulkAddProducts,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.post("/add", addProduct);
router.post("/bulk", bulkAddProducts); // ← bulk route
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
