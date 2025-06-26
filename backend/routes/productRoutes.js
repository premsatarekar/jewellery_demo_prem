import express from "express";
import {
  addProduct,
  bulkAddProducts,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductByHSN,
  getProductByBarcode,
  getBarcodePdf,
} from "../controllers/productController.js";

const router = express.Router();

router.post("/add", addProduct);
router.post("/bulk", bulkAddProducts);
router.get("/", getProducts);
router.get("/hsn/:hsn", getProductByHSN);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.get("/barcode/:barcode", getProductByBarcode);
router.get("/barcode/pdf/:barcode", getBarcodePdf);

export default router;
