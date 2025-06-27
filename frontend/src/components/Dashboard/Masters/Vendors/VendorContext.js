// src/components/Vendors/VendorContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import API from "../../../../api"; // ✅ yeh line change karo

export const VendorContext = createContext();
export const useVendor = () => useContext(VendorContext);

export const VendorProvider = ({ children }) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await API.get("/vendors");
        setVendors(data);
      } catch (err) {
        console.error("Fetch vendors failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addVendor = async (payload) => {
    try {
      const { data } = await API.post("/vendors/add", payload);
      setVendors((prev) => [...prev, { id: data.id, ...payload }]);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        msg: err.response?.data?.msg || "Server error",
      };
    }
  };

  const updateVendor = async (id, payload) => {
    try {
      await API.put(`/vendors/${id}`, payload);
      setVendors((prev) =>
        prev.map((v) => (v.id === id ? { id, ...payload } : v))
      );
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        msg: err.response?.data?.msg || "Server error",
      };
    }
  };

  const deleteVendor = async (id) => {
    try {
      await API.delete(`/vendors/${id}`);
      setVendors((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <VendorContext.Provider
      value={{ vendors, loading, addVendor, updateVendor, deleteVendor }}
    >
      {children}
    </VendorContext.Provider>
  );
};
