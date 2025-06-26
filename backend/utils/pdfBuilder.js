import PDFDocument from "pdfkit";
import fs from "fs";
import os from "os";
import path from "path";

/**
 * Save barcode image to PDF file on Desktop/barcodes
 * @param {Buffer} barcodeBuffer - Barcode image buffer (PNG)
 * @param {string} label - Date-Time string (optional for watermark)
 * @param {string} mode - 'single' or other
 * @param {string} productCode - product_code to name the PDF
 */
export const addBarcodeToPdf = async (
  barcodeBuffer,
  label,
  mode = "single",
  productCode = "barcode"
) => {
  try {
    // Get Desktop path
    const desktopDir = path.join(os.homedir(), "Desktop");
    const barcodeDir = path.join(desktopDir, "barcodes");

    // Create barcodes folder if not exist
    if (!fs.existsSync(barcodeDir)) {
      fs.mkdirSync(barcodeDir, { recursive: true });
    }

    // PDF path
    const filePath = path.join(barcodeDir, `${productCode}.pdf`);

    // Create PDF
    const doc = new PDFDocument({ size: "A6", margin: 20 });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    doc.image(barcodeBuffer, {
      fit: [200, 100],
      align: "center",
      valign: "center",
    });

    doc.moveDown();
    doc.fontSize(10).text(label, { align: "center" });

    doc.end();

    await new Promise((resolve) => writeStream.on("finish", resolve));
    console.log(`✅ Barcode saved: ${filePath}`);
  } catch (err) {
    console.error("❌ PDF Save Error:", err);
    throw err;
  }
};

// Add this function below addBarcodeToPdf
export const generateBulkBarcodePDF = async (products) => {
  const PDFDocument = (await import("pdfkit")).default;

  const desktopDir = path.join(os.homedir(), "Desktop");
  const barcodeDir = path.join(desktopDir, "barcodes");

  if (!fs.existsSync(barcodeDir)) {
    fs.mkdirSync(barcodeDir, { recursive: true });
  }

  const filePath = path.join(barcodeDir, `bulk_barcodes_${Date.now()}.pdf`);
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  let x = 40, y = 40;
  let count = 0;

  for (const product of products) {
    const img = product.barcodeImageBase64?.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(img, "base64");

    doc.image(buffer, x, y, { width: 200, height: 80 });
    doc.fontSize(10).text(product.productName || "", x, y + 85);
    doc.fontSize(10).text(`₹${product.price || 0}`, x + 100, y + 85);
    doc.fontSize(8).fillColor("gray").text(new Date().toLocaleString("en-IN"), x, y + 100);

    count++;

    if (count % 2 === 0) {
      x = 40;
      y += 140;
    } else {
      x += 270;
    }

    if (count % 8 === 0) {
      doc.addPage();
      x = 40;
      y = 40;
    }
  }

  doc.end();
  await new Promise((resolve) => writeStream.on("finish", resolve));
  console.log("✅ Bulk barcode PDF generated at:", filePath);
};

