// backend/routes/profileRoutes.js
import express from "express";
import { getProfile, saveProfile } from "../controllers/profileController.js";

const router = express.Router();

router.get("/", getProfile); // GET  /api/profile
router.put("/", saveProfile); // PUT  /api/profile

export default router;
