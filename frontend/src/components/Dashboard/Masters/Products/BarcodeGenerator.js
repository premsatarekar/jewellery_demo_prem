import React, { useEffect, useRef, useCallback } from "react";
import JsBarcode from "jsbarcode";

const BarcodeGenerator = ({
  value,
  productName,
  price,
  showButtons = false,
  compact = false,
  onBase64Ready = () => {}, // 👈 callback prop
}) => {
  const svgRef = useRef(null);

  // ✅ useCallback to make it stable and warning-free
  const generateBase64FromSvg = useCallback(
    (svgElement) => {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const base64String = canvas.toDataURL("image/png").split(",")[1];
        onBase64Ready(base64String); // 👈 callback fired
      };

      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    },
    [onBase64Ready]
  );

  // ✅ useEffect with clean dependencies
  useEffect(() => {
    if (svgRef.current && value) {
      JsBarcode(svgRef.current, value, {
        format: "CODE128",
        lineColor: "#000",
        width: 2,
        height: 50,
        displayValue: true,
      });

      generateBase64FromSvg(svgRef.current);
    }
  }, [value, generateBase64FromSvg]);

  // 🔽 Rest code same (no changes)
  const handleDownload = () => {
    const svg = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.download = `${value}.png`;
      link.href = pngFile;
      link.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handlePrint = () => {
    const svg = svgRef.current;
    const win = window.open("", "PrintWindow");
    win.document.write(`
      <html>
        <head><title>Print Barcode</title></head>
        <body style="text-align: center;">
          <svg xmlns="http://www.w3.org/2000/svg">${svg.innerHTML}</svg>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div style={{ textAlign: "center" }}>
      {!compact && productName && (
        <div style={{ fontWeight: "bold", marginBottom: 4 }}>{productName}</div>
      )}
      {!compact && price && (
        <div style={{ fontSize: 13, color: "#555", marginBottom: 10 }}>
          Price: ₹{price}
        </div>
      )}
      <svg ref={svgRef}></svg>

      {showButtons && (
        <div style={{ marginTop: 10 }}>
          <button onClick={handleDownload} style={btnStyle}>
            Download
          </button>{" "}
          <button
            onClick={handlePrint}
            style={{ ...btnStyle, backgroundColor: "#28a745" }}
          >
            Print
          </button>
        </div>
      )}
    </div>
  );
};

const btnStyle = {
  marginTop: 10,
  padding: "6px 12px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 14,
};

export default BarcodeGenerator;
