// utils/barcodeGenerator.js
import bwipjs from "bwip-js";

export const generateBarcodeImage = async (text) => {
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer(
      {
        bcid: "code128",       // Barcode type
        text: text,            // Text to encode
        scale: 3,              // 3x scaling
        height: 10,            // Bar height
        includetext: true,     // Show human-readable text
        textxalign: "center",  // Centered text
      },
      (err, png) => {
        if (err) {
          reject(err);
        } else {
          resolve(png); // PNG Buffer
        }
      }
    );
  });
};
