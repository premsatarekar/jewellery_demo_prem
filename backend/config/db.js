import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const db = mysql.createPool({
  host:     process.env.DB_HOST || "localhost",
  user:     process.env.DB_USER || "root",
  password: process.env.DB_PASS || "prem@#123",
  database: process.env.DB_NAME || "jewellery_ms",
  waitForConnections: true,
  connectionLimit: 10,
});

export default db;
