import axios from "axios";

// Dynamically use correct backend URL from .env
const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:5000",
  withCredentials: true,
});

export default API;
