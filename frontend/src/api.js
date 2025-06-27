// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "https://jewellery-demo-prem-1.onrender.com/api", // ✅ yeh tera backend ka URL
  withCredentials: true, // optional if you're using cookies
});

export default API;
