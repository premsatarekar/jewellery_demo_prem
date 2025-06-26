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

  const [loadingUser, setLoadingUser] = useState(true); // 🟡 loading state added

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    const storedRole = localStorage.getItem("role");

    // 🔐 Role load logic
    const finalRole =
      storedRole || storedUser?.user_type || storedUser?.role || "";

    if (storedUser) {
      setUser({
        name: storedUser.username || storedUser.name || "",
        email: storedUser.email || "",
        image: localStorage.getItem(storageKeys.image) || "",
        shopName: localStorage.getItem(storageKeys.shopName) || "",
        shopAddress: localStorage.getItem(storageKeys.shopAddress) || "",
        mobile: localStorage.getItem(storageKeys.mobile) || "",
        gst: localStorage.getItem(storageKeys.gst) || "",
        role: finalRole.toLowerCase(),
      });
    }

    setLoadingUser(false); // ✅ wait done
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
    <UserContext.Provider value={{ user, updateUser, logoutUser, loadingUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
