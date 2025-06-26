// server.js
// ==========================
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);

// ------- Routes ----------
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

import db from "./config/db.js"; // mysql2/promise pool

// --------------------------
//  App init
// --------------------------
const app = express();

// ✅ ALLOW CORS FOR BOTH LOCALHOST & VERCEL
const allowedOrigins = [
  "http://localhost:3000",
  "https://jewellery-demo-prem.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// --------------------------
//  Test DB connection once
// --------------------------
try {
  const connection = await db.getConnection(); // top‑level await
  console.log("✅ MySQL connected");
  connection.release(); // release back to pool
} catch (err) {
  console.error("❌ DB connection failed:", err.message);
  process.exit(1); // Stop server if DB dead
}

// --------------------------
//  Routes
// --------------------------
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/profile", profileRoutes);

// Health‑check / root
app.get("/", (_req, res) => {
  res.send("Jewellery Management Backend API running...");
});

// --------------------------
//  Start server
// --------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
