// src/components/Dashboard/Sales/PrintInvoice.js
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ✅ Use env base URL
const BASE = process.env.REACT_APP_API_BASE_URL;
const API_SALES = `${BASE}/api/sales`;
const API_PROFILE = `${BASE}/api/profile`;

export default function PrintInvoice() {
  const { invoiceNo } = useParams(); // /dashboard/sales/print-invoice/:invoiceNo
  const printRef = useRef();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inv, setInv] = useState(null);

  // 🔸 default values – अगर profile ख़ाली हो तो भी दिखे
  const [shop, setShop] = useState({
    shop_name: "JEWELLERY ME – MODULE",
    shop_address: "Street Address, City",
    gst_number: "29ABCDE1234F1Z5",
    mobile: "(123) 456-7890",
  });

  useEffect(() => {
    (async () => {
      try {
        const invReq = axios.get(`${API_SALES}/${invoiceNo}`);
        const profReq = axios.get(API_PROFILE);

        const [{ data: invData }, { data: profData }] = await Promise.all([
          invReq,
          profReq,
        ]);

        setInv(invData);
        if (profData) setShop(profData); // overwrite defaults
      } catch (e) {
        console.error(e);
        setError(e.response?.data?.msg || "Unable to fetch invoice.");
      } finally {
        setLoading(false);
      }
    })();

    window.scrollTo(0, 0);
  }, [invoiceNo]);

  /* ---------- helpers ---------- */
  const handlePrint = () => window.print();

  const handleDownload = async () => {
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "pt", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoiceNo || "invoice"}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Unable to generate PDF. Try printing instead.");
    }
  };

  /* ---------- guards ---------- */
  if (loading) return <p style={{ padding: 24 }}>Loading invoice…</p>;
  if (error) return <p style={{ padding: 24, color: "red" }}>{error}</p>;
  if (!inv) return null;

  /* ---------- destructure values ---------- */
  const {
    invoice_no: invoiceNumber,
    invoice_date: date,
    customer_name: customerName,
    payment_mode: paymentMode,
    utr_number: paymentId,
    state: region,
    items = [],
    sub_total: subTotal = 0,
    cgst = 0,
    sgst = 0,
    igst = 0,
    discount_percent: discountPercent = 0,
    total: amountPaid = 0,
  } = inv;

  const subTotalNum = +subTotal;
  const taxAmountNum = +cgst + +sgst + +igst;
  const discountNum = (subTotalNum * +discountPercent) / 100;
  const totalNum = subTotalNum + taxAmountNum - discountNum;
  const amountPaidNum = +amountPaid;
  const balanceNum = Math.max(0, totalNum - amountPaidNum);

  /* ---------- UI ---------- */
  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      {/* top buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <button onClick={handleDownload} style={buttonStyle("green")}>
          ⬇️ Download
        </button>
        <button onClick={handlePrint} style={buttonStyle("orange")}>
          🖨️ Print
        </button>
      </div>

      {/* printable area */}
      <div
        ref={printRef}
        style={{
          maxWidth: 900,
          margin: "auto",
          padding: 25,
          background: "#fff",
          border: "1px solid #ccc",
        }}
      >
        {/* header */}
        <div
          style={{
            borderBottom: "2px solid #000",
            paddingBottom: 10,
            marginBottom: 16,
          }}
        >
          <h2 style={{ color: "darkorange", margin: 0 }}>
            {shop.shop_name || "My Jewellery Shop"}
          </h2>
          <small>
            <strong>Address:</strong> {shop.shop_address || "—"} <br />
            <strong>GSTIN:</strong> {shop.gst_number || "—"} <br />
            <strong>Phone:</strong> {shop.mobile || "—"}
          </small>
        </div>

        {/* invoice meta */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
            fontSize: 14,
          }}
        >
          <span>
            <strong>Invoice No:</strong> {invoiceNumber}
          </span>
          <span>
            <strong>Date:</strong> {date}
          </span>
        </div>

        {/* buyer info */}
        <div style={{ fontSize: 14, marginBottom: 10 }}>
          <strong>Buyer:</strong>
          <p style={{ margin: 0 }}>{customerName || "N/A"}</p>
          <p style={{ margin: 0 }}>{region || ""}</p>
          <p style={{ margin: 0 }}>Payment Mode: {paymentMode}</p>
          {paymentId && <p style={{ margin: 0 }}>Payment ID: {paymentId}</p>}
        </div>

        {/* items table */}
        <table
          style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}
        >
          <thead>
            <tr style={{ background: "#eee" }}>
              <th style={thStyle}>Description</th>
              <th style={thStyle}>Qty</th>
              <th style={thStyle}>Rate (₹)</th>
              <th style={thStyle}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.length ? (
              items.map((it, i) => (
                <tr key={i}>
                  <td style={tdStyle}>{it.item_name || it.productName}</td>
                  <td style={tdStyle}>{it.quantity}</td>
                  <td style={tdStyle}>{(+it.cost).toFixed(2)}</td>
                  <td style={tdStyle}>
                    {(+it.amount || +it.total).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={tdStyle} align="center">
                  No items in invoice
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* totals */}
        <div style={{ marginTop: 20, textAlign: "right", fontSize: 14 }}>
          <p>
            <strong>Sub-total:</strong> ₹{subTotalNum.toFixed(2)}
          </p>
          <p>
            <strong>Tax:</strong> ₹{taxAmountNum.toFixed(2)}
          </p>
          <p>
            <strong>Discount:</strong> ₹{discountNum.toFixed(2)}
          </p>
          <p>
            <strong>Total:</strong> ₹{totalNum.toFixed(2)}
          </p>
          <p>
            <strong>Amount Paid:</strong> ₹{amountPaidNum.toFixed(2)}
          </p>
          <p>
            <strong>Balance:</strong> ₹{balanceNum.toFixed(2)}
          </p>
        </div>

        {/* footer note */}
        <div
          style={{
            marginTop: 30,
            textAlign: "center",
            fontSize: 13,
            color: "gray",
          }}
        >
          <p>
            Make all cheques payable to {shop.shop_name || "Your Company Name"}
          </p>
          <p>Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- inline styles ---------- */
const thStyle = {
  padding: 10,
  border: "1px solid #ccc",
  fontWeight: "bold",
  textAlign: "left",
};
const tdStyle = { padding: 10, border: "1px solid #ccc", textAlign: "left" };
const buttonStyle = (bg) => ({
  padding: "8px 16px",
  background: bg,
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
});
