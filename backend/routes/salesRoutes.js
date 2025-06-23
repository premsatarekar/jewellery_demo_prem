import express from "express";
import {
  addSale,
  listSales,
  getSale,
  updateSale,
  deleteSale,
  salesReport,
} from "../controllers/salesController.js";

const router = express.Router();

router.post("/add", addSale);
router.get("/", listSales);
router.get("/report", salesReport);           // /api/sales/report?... query params
router.get("/:invoiceNo", getSale);
router.put("/:invoiceNo", updateSale);
router.delete("/:invoiceNo", deleteSale);

export default router;
