// /routes/authRoutes.js
import { Router } from "express";
import {
  login,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getLoginLogs
} from "../controllers/authController.js";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.get("/logs", getLoginLogs);

export default router;
