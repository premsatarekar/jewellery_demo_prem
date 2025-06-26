import express from "express";
import {
  addSale,
  listSales,
  getSale,
  updateSale,
  deleteSale,
  salesReport,
  getProductForSalesByBarcode,
} from "../controllers/salesController.js";

const router = express.Router();

router.post("/add", addSale);
router.get("/", listSales);
router.get("/report", salesReport);
router.get("/:invoiceNo", getSale);
router.put("/:invoiceNo", updateSale);
router.delete("/:invoiceNo", deleteSale);
router.get("/barcode/:barcode", getProductForSalesByBarcode);

export default router;
