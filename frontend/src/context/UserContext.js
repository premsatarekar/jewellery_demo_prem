import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

const storageKeys = {
  name: "profileName",
  email: "email",
  image: "profilePic",
  shopName: "shopName",
  shopAddress: "shopAddress",
  mobile: "mobile",
  gst: "gst",
  role: "role",
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    image: "",
    shopName: "",
    shopAddress: "",
    mobile: "",
    gst: "",
    role: "",
  });

  // Load from localStorage on initial mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    const storedRole = localStorage.getItem("role");

    if (storedUser) {
      setUser({
        name: storedUser.username || storedUser.name || "",
        email: storedUser.email || "",
        image: localStorage.getItem(storageKeys.image) || "",
        shopName: localStorage.getItem(storageKeys.shopName) || "",
        shopAddress: localStorage.getItem(storageKeys.shopAddress) || "",
        mobile: localStorage.getItem(storageKeys.mobile) || "",
        gst: localStorage.getItem(storageKeys.gst) || "",
        role: storedRole || storedUser.user_type || "",
      });
    }
  }, []);

  const updateUser = (key, value) => {
    setUser((prev) => ({ ...prev, [key]: value }));
    const localStorageKey = storageKeys[key];
    if (localStorageKey) {
      localStorage.setItem(localStorageKey, value);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    Object.values(storageKeys).forEach((key) => localStorage.removeItem(key));
    setUser({
      name: "",
      email: "",
      image: "",
      shopName: "",
      shopAddress: "",
      mobile: "",
      gst: "",
      role: "",
    });
  };

  return (
    <UserContext.Provider value={{ user, updateUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
