import fs from "fs";
import path from "path";
import { PDFDocument, rgb } from "pdf-lib";
import { createCanvas } from "canvas";
import JsBarcode from "jsbarcode";

// 🧠 Helper: Create barcode image from code
function generateBarcodeImage(code) {
  const canvas = createCanvas();
  JsBarcode(canvas, code, {
    format: "CODE128",
    width: 2,
    height: 50,
    displayValue: true,
  });
  return canvas.toBuffer("image/png");
}

// 🧾 Single barcode PDF (already used in Add Product)
export async function generateBarcodePDF(code) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([200, 100]);
  const pngImage = await pdfDoc.embedPng(generateBarcodeImage(code));
  page.drawImage(pngImage, {
    x: 30,
    y: 25,
    width: 140,
    height: 50,
  });

  const pdfBytes = await pdfDoc.save();
  const savePath = path.join("barcodes", `${code}.pdf`);
  fs.writeFileSync(savePath, pdfBytes);
}

// 🧾 Bulk barcode PDF
export async function generateBulkBarcodePDF(products) {
  const pdfDoc = await PDFDocument.create();
  const barcodeWidth = 240;
  const barcodeHeight = 80;

  let page = pdfDoc.addPage([595, 842]); // A4 size
  let x = 50,
    y = 750;
  let count = 0;

  for (const product of products) {
    const barcodeImage = await pdfDoc.embedPng(
      generateBarcodeImage(product.barcode)
    );

    // Draw barcode
    page.drawImage(barcodeImage, {
      x,
      y,
      width: barcodeWidth,
      height: barcodeHeight,
    });

    // Product Name
    page.drawText(product.productName || "", {
      x: x,
      y: y + barcodeHeight + 10,
      size: 10,
      color: rgb(0, 0, 0),
    });

    // Price
    page.drawText(`₹${product.price || 0}`, {
      x: x + 100,
      y: y + barcodeHeight + 10,
      size: 10,
      color: rgb(0, 0, 0),
    });

    // Date-time (bottom-left of box)
    const now = new Date().toLocaleString("en-IN");
    page.drawText(now, {
      x,
      y: y - 15,
      size: 8,
      color: rgb(0.3, 0.3, 0.3),
    });

    count++;

    // Layout: 2 per row
    if (count % 2 === 0) {
      x = 50;
      y -= 130;
    } else {
      x += 270; // Next column
    }

    // 8 per page
    if (count % 8 === 0) {
      page = pdfDoc.addPage([595, 842]); // new page
      x = 50;
      y = 750;
    }
  }
  
// ✅ Ensure "barcodes" folder exists
  const dir = path.join("barcodes");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const pdfBytes = await pdfDoc.save();
  const savePath = path.join("barcodes", `bulk_barcodes_${Date.now()}.pdf`);
  fs.writeFileSync(savePath, pdfBytes);
}
