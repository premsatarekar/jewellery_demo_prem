// src/components/Loader.jsx
import React from "react";
import Lottie from "lottie-react";
import animationData from "../assets/loader.json";
import "./Loader.css";

export default function Loader({ size = 180 }) {
  return (
    <div className="loader-overlay">
      {" "}
      <Lottie
        animationData={animationData}
        loop
        autoplay
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: "transparent",
        }}
      />
    </div>
  );
}
