// src/components/Vendors/VendorManager.jsx
import React from "react";
import { VendorProvider } from "./VendorContext"; // ⬅️ backend‑connected context
import AddVendor   from "./AddVendor";
import VendorList  from "./VendorList";


const VendorManager = () => (
  <VendorProvider>
    <AddVendor   />   
    <VendorList />    
  </VendorProvider>
);

export default VendorManager;
