import express from "express";
import {
  addExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController.js";

const router = express.Router();

router.post("/", addExpense);          // /api/expenses  POST
router.get("/", getAllExpenses);       // /api/expenses  GET   <- list first
router.get("/:id", getExpenseById);    // /api/expenses/:id
router.put("/:id", updateExpense);     // /api/expenses/:id
router.delete("/:id", deleteExpense);  // /api/expenses/:id

export default router;
