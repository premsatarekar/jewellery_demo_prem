import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

let dbConfig = {};

if (process.env.MYSQL_URL) {
  const { hostname, port, username, password, pathname } = new URL(
    process.env.MYSQL_URL
  );

  dbConfig = {
    host: hostname,
    port,
    user: username,
    password,
    database: pathname.replace("/", ""),
    waitForConnections: true,
    connectionLimit: 10,
  };
} else {
  dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
  };
}

const db = mysql.createPool(dbConfig);

export default db;
