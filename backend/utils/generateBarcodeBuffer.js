import JsBarcode from "jsbarcode";
import { createCanvas } from "canvas";

export const generateBarcodeBuffer = async (barcode) => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = createCanvas();
      JsBarcode(canvas, barcode, {
        format: "CODE128",
        width: 2,
        height: 100,
        displayValue: true,
        fontSize: 16,
      });

      const buffer = canvas.toBuffer("image/png");
      resolve(buffer);
    } catch (err) {
      reject(err);
    }
  });
};
