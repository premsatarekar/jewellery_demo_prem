// server.js
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

// ✅ ALLOW CORS FOR LOCAL + VERCEL + RENDER
const allowedOrigins = [
  "http://localhost:3000",
  "https://jewellery-demo-prem.vercel.app",
  "https://jewellery-demo-prem-1.vercel.app",
  "https://jewellery-demo-prem-1.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("🌐 Incoming request from origin:", origin);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else if (process.env.NODE_ENV !== "production") {
        console.warn("⚠️ Temporarily allowing unknown origin (DEV):", origin);
        callback(null, true); // allow during development
      } else {
        console.error("⛔ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ DB connection check (top-level await supported in ES module)
try {
  const connection = await db.getConnection();
  console.log("✅ MySQL connected");
  connection.release();
} catch (err) {
  console.error("❌ DB connection failed:", err.message);
  process.exit(1);
}

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/profile", profileRoutes);

// ✅ Health check
app.get("/", (_req, res) => {
  res.send("Jewellery Management Backend API running...");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
