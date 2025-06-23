// src/components/Vendors/VendorContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

export const VendorContext   = createContext();
export const useVendor       = () => useContext(VendorContext);

export const VendorProvider = ({ children }) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ----------- LOAD ALL (GET /api/vendors) ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/api/vendors");   // ✅ plural
        setVendors(data);
      } catch (err) {
        console.error("Fetch vendors failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ----------- ADD (POST /api/vendors/add) ---------------- */
  const addVendor = async (payload) => {
    try {
      const { data } = await axios.post("/api/vendors/add", payload); // ✅ plural
      // backend returns { id }
      setVendors((prev) => [...prev, { id: data.id, ...payload }]);
      return { ok: true };
    } catch (err) {
      return {
        ok:  false,
        msg: err.response?.data?.msg || "Server error",
      };
    }
  };

  /* ----------- UPDATE (PUT /api/vendors/:id) -------------- */
  const updateVendor = async (id, payload) => {
    try {
      await axios.put(`/api/vendors/${id}`, payload);        // ✅ plural
      setVendors((prev) =>
        prev.map((v) => (v.id === id ? { id, ...payload } : v))
      );
      return { ok: true };
    } catch (err) {
      return { ok: false, msg: err.response?.data?.msg || "Server error" };
    }
  };

  /* ----------- DELETE (DELETE /api/vendors/:id) ----------- */
  const deleteVendor = async (id) => {
    try {
      await axios.delete(`/api/vendors/${id}`);             // ✅ plural
      setVendors((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  /* ----------- provide ----------- */
  return (
    <VendorContext.Provider
      value={{ vendors, loading, addVendor, updateVendor, deleteVendor }}
    >
      {children}
    </VendorContext.Provider>
  );
};
