// SalesAdd.js (backend‑connected version, UI unchanged)
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // ← NEW
import BarcodeScannerComponent from "./BarcodeScannerComponent";
import "./SalesAdd.css";

const BASE = process.env.REACT_APP_API_BASE_URL;
const API_URL = `${BASE}/api/sales`;

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
  "Chandigarh",
  "Andaman and Nicobar Islands",
  "Dadra and Nagar Haveli and Daman and Diu",
];

const generateInvoiceNumber = () => "INV" + Date.now();

const SalesAdd = () => {
  const navigate = useNavigate();
  const scannerRef = useRef();
  const [showScanner, setShowScanner] = useState(false);
  const [invoiceNumber] = useState(generateInvoiceNumber()); // client‑side invoice no.

  const [invoiceData, setInvoiceData] = useState({
    customerName: "",
    invoiceDate: "",
    paymentMode: "",
    chequeNumber: "",
    utrNumber: "",
    state: "",
    amountPaid: "",
    taxPercent: "",
    discountPercent: "",
    cgst: "",
    sgst: "",
    igst: "",
    subTotal: 0,
    total: 0,
  });

  const [lineItems, setLineItems] = useState([
    {
      itemName: "",
      weight: "",
      quantity: "",
      cost: "",
      makingCharges: "",
      amount: 0,
      barcode: "",
    },
  ]);

  const [errors, setErrors] = useState({});

  const handleLineItemChange = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] = value;

    const quantity = parseFloat(updated[index].quantity || 0);
    const cost = parseFloat(updated[index].cost || 0);
    const makingCharges = parseFloat(updated[index].makingCharges || 0);
    const itemTotal = (cost + cost * (makingCharges / 100)) * quantity;
    updated[index].amount = isNaN(itemTotal) ? 0 : itemTotal;

    setLineItems(updated);
    calculateTotals(updated);
  };

  const calculateTotals = useCallback(
    (items) => {
      const subTotal = items.reduce(
        (acc, item) => acc + parseFloat(item.amount || 0),
        0
      );
      const taxPercent = parseFloat(invoiceData.taxPercent || 0);
      const discountPercent = parseFloat(invoiceData.discountPercent || 0);

      const discount = subTotal * (discountPercent / 100);
      const taxableAmount = subTotal - discount;
      const taxAmount = taxableAmount * (taxPercent / 100);

      let cgst = 0,
        sgst = 0,
        igst = 0;
      if (invoiceData.state.toLowerCase() === "karnataka") {
        cgst = taxAmount / 2;
        sgst = taxAmount / 2;
      } else {
        igst = taxAmount;
      }

      const total = parseFloat((taxableAmount + taxAmount).toFixed(2));

      setInvoiceData((prev) => ({
        ...prev,
        subTotal,
        cgst: cgst.toFixed(2),
        sgst: sgst.toFixed(2),
        igst: igst.toFixed(2),
        total,
      }));
    },
    [
      invoiceData.taxPercent,
      invoiceData.discountPercent,
      invoiceData.state,
      setInvoiceData,
    ]
  );

  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...invoiceData };

    // Input restrictions
    if (name === "customerName") {
      if (!/^[A-Za-z\s]{0,30}$/.test(value)) return;
    }

    if (
      ["amountPaid", "taxPercent", "discountPercent"].includes(name) &&
      value !== "" &&
      !/^\d{0,6}(\.\d{0,2})?$/.test(value)
    ) {
      return;
    }

    updated[name] = value;
    setInvoiceData(updated);

    if (["taxPercent", "discountPercent", "state"].includes(name)) {
      calculateTotals(lineItems);
    }
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        itemName: "",
        weight: "",
        quantity: "",
        cost: "",
        makingCharges: "",
        amount: 0,
        barcode: "",
      },
    ]);
  };

  const removeLineItem = (index) => {
    const updated = [...lineItems];
    updated.splice(index, 1);
    setLineItems(updated);
    calculateTotals(updated);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!invoiceData.customerName)
      newErrors.customerName = "Customer name is required";
    if (!invoiceData.paymentMode)
      newErrors.paymentMode = "Payment mode is required";
    if (!invoiceData.state) newErrors.state = "State is required";
    if (!invoiceData.amountPaid || isNaN(invoiceData.amountPaid))
      newErrors.amountPaid = "Valid amount paid is required";
    if (!invoiceData.taxPercent || isNaN(invoiceData.taxPercent))
      newErrors.taxPercent = "Valid tax percentage is required";
    if (invoiceData.paymentMode === "Cheque" && !invoiceData.chequeNumber)
      newErrors.chequeNumber = "Cheque number required";
    if (invoiceData.paymentMode === "Online" && !invoiceData.utrNumber)
      newErrors.utrNumber = "UTR number required";

    lineItems.forEach((item, index) => {
      if (!item.itemName) newErrors[`itemName_${index}`] = "Item name required";
      if (!item.quantity || isNaN(item.quantity))
        newErrors[`quantity_${index}`] = "Valid quantity required";
      if (!item.cost || isNaN(item.cost))
        newErrors[`cost_${index}`] = "Valid cost required";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const payload = {
      invoice_no: invoiceNumber,
      customer_name: invoiceData.customerName,
      invoice_date: invoiceData.invoiceDate,
      payment_mode: invoiceData.paymentMode,
      cheque_no: invoiceData.chequeNumber || null,
      utr_number: invoiceData.utrNumber || null,
      state: invoiceData.state,
      amount_paid: Number(invoiceData.amountPaid),
      tax_percent: Number(invoiceData.taxPercent),
      discount_percent: Number(invoiceData.discountPercent || 0),
      cgst: Number(invoiceData.cgst || 0),
      sgst: Number(invoiceData.sgst || 0),
      igst: Number(invoiceData.igst || 0),
      sub_total: Number(invoiceData.subTotal),
      total: Number(invoiceData.total),
      items: lineItems.map((it) => ({
        itemName: it.itemName,
        weight: it.weight || null,
        quantity: Number(it.quantity || 0),
        cost: Number(it.cost || 0),
        makingCharges: Number(it.makingCharges || 0),
        amount: Number(it.amount || 0),
        barcode: it.barcode || null,
      })),
    };

    try {
      await axios.post(API_URL + "/add", payload);
      alert("Sale saved successfully ✔️");
      navigate("/dashboard/sales/list");
    } catch (err) {
      console.error("SAVE SALE ERR:", err);
      alert(err.response?.data?.msg || "Server error, please try again");
    }
  };

  const handleBarcodeScan = useCallback(
    async (barcode) => {
      try {
        const { data } = await axios.get(
          `${BASE}/api/sales/barcode/${barcode}`
        );

        const updated = [...lineItems];
        updated[0] = {
          ...updated[0],
          itemName: data.product_name,
          weight: data.weight,
          quantity: 1,
          cost: data.selling_price,
          makingCharges: data.making_charges || 0,
          barcode: barcode,
        };

        // amount bhi calculate ho jaayega
        const cost = parseFloat(data.selling_price || 0);
        const making = parseFloat(data.making_charges || 0);
        const amount = cost + cost * (making / 100);
        updated[0].amount = amount;

        setLineItems(updated);
        calculateTotals(updated);
        setShowScanner(false);
      } catch (err) {
        alert("Product not found with scanned barcode ❌");
        setShowScanner(false);
      }
    },
    [lineItems, calculateTotals]
  );

  useEffect(() => {
    if (showScanner) {
      setTimeout(() => scannerRef.current?.startScanning?.(), 200);
    }
  }, [showScanner]);

  return (
    <div className="sales-container">
      <h1 className="sales-title">Jewellery Application</h1>

      <div className="sales-grid">
        <div className="sales-field">
          <label>Invoice Number</label>
          <input value={invoiceNumber} readOnly />
        </div>

        {[
          ["Customer Name*", "customerName", "text", "Enter customer name"],
          ["Invoice Date*", "invoiceDate", "date", "Select invoice date"],
          ["Amount Paid*", "amountPaid", "text", "Enter amount paid"],
          ["Tax (%)*", "taxPercent", "text", "Enter tax percentage"],
          [
            "Discount (%)",
            "discountPercent",
            "text",
            "Enter discount (optional)",
          ],
        ].map(([label, name, type, placeholder]) => (
          <div className="sales-field" key={name}>
            <label>{label}</label>
            <input
              type={type}
              name={name}
              value={invoiceData[name]}
              onChange={handleInvoiceChange}
              placeholder={placeholder}
            />
            {errors[name] && <small className="error">{errors[name]}</small>}
          </div>
        ))}

        <div className="sales-field">
          <label>Payment Mode*</label>
          <select
            name="paymentMode"
            value={invoiceData.paymentMode}
            onChange={handleInvoiceChange}
          >
            <option value="">Select Mode</option>
            <option value="Cash">Cash</option>
            <option value="Online">Online</option>
            <option value="Cheque">Cheque</option>
          </select>
          {errors.paymentMode && (
            <small className="error">{errors.paymentMode}</small>
          )}
        </div>
        {invoiceData.paymentMode === "Online" && (
          <div className="sales-field">
            <label>UTR Number*</label>
            <input
              name="utrNumber"
              value={invoiceData.utrNumber}
              onChange={handleInvoiceChange}
              placeholder="Enter UTR number"
            />
            {errors.utrNumber && (
              <small className="error">{errors.utrNumber}</small>
            )}
          </div>
        )}

        {invoiceData.paymentMode === "Cheque" && (
          <div className="sales-field">
            <label>Cheque Number*</label>
            <input
              name="chequeNumber"
              value={invoiceData.chequeNumber}
              onChange={handleInvoiceChange}
              placeholder="Enter cheque number"
            />
            {errors.chequeNumber && (
              <small className="error">{errors.chequeNumber}</small>
            )}
          </div>
        )}

        <div className="sales-field">
          <label>State*</label>
          <select
            name="state"
            value={invoiceData.state}
            onChange={handleInvoiceChange}
          >
            <option value="">Select State</option>
            {indianStates.map((state, i) => (
              <option key={i} value={state}>
                {state}
              </option>
            ))}
          </select>
          {errors.state && <small className="error">{errors.state}</small>}
        </div>

        <div className="sales-field">
          <label>CGST</label>
          <input readOnly value={invoiceData.cgst} />
        </div>
        <div className="sales-field">
          <label>SGST</label>
          <input readOnly value={invoiceData.sgst} />
        </div>
        <div className="sales-field">
          <label>IGST</label>
          <input readOnly value={invoiceData.igst} />
        </div>
      </div>

      <h2 className="section-title">Product Details</h2>
      <table className="product-table">
        <thead>
          <tr>
            <th>Item Details</th>
            <th>Weight</th>
            <th>Quantity</th>
            <th>Sales Cost</th>
            <th>Making Charges (%)</th>
            <th>Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item, i) => (
            <tr key={i}>
              <td>
                <input
                  placeholder="Product"
                  value={item.itemName}
                  onChange={(e) =>
                    handleLineItemChange(i, "itemName", e.target.value)
                  }
                />
                {errors[`itemName_${i}`] && (
                  <small className="error">{errors[`itemName_${i}`]}</small>
                )}
              </td>
              <td>
                <input
                  placeholder="Weight (g)"
                  value={item.weight}
                  onChange={(e) =>
                    handleLineItemChange(i, "weight", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  placeholder="Quantity"
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleLineItemChange(i, "quantity", e.target.value)
                  }
                />
                {errors[`quantity_${i}`] && (
                  <small className="error">{errors[`quantity_${i}`]}</small>
                )}
              </td>
              <td>
                <input
                  placeholder="Sales Cost"
                  type="number"
                  value={item.cost}
                  onChange={(e) =>
                    handleLineItemChange(i, "cost", e.target.value)
                  }
                />
                {errors[`cost_${i}`] && (
                  <small className="error">{errors[`cost_${i}`]}</small>
                )}
              </td>
              <td>
                <input
                  placeholder="Making %"
                  type="number"
                  value={item.makingCharges}
                  onChange={(e) =>
                    handleLineItemChange(i, "makingCharges", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  readOnly
                  type="number"
                  value={isNaN(item.amount) ? "0.00" : item.amount.toFixed(2)}
                />
              </td>
              <td>
                {i === 0 ? (
                  <button
                    className="scan-button"
                    onClick={() => setShowScanner(true)}
                  >
                    Scan
                  </button>
                ) : (
                  <button onClick={() => removeLineItem(i)}>✕</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="add-line-btn" onClick={addLineItem}>
        + Add Line Item
      </button>

      <div className="totals-grid">
        <div>
          <label>Sub-Total</label>
          <input
            readOnly
            type="number"
            value={invoiceData.subTotal.toFixed(2)}
          />
        </div>
        <div>
          <label>Total</label>
          <input readOnly type="number" value={invoiceData.total.toFixed(2)} />
        </div>
      </div>

      <div className="form-actions">
        <button onClick={handleSave}>+ Add Sales</button>
        <button type="button" onClick={() => window.location.reload()}>
          Reset
        </button>
      </div>

      {showScanner && (
        <div className="scanner-popup">
          <div className="scanner-popup-content">
            <button
              className="close-scanner"
              onClick={() => {
                scannerRef.current?.stopScanning();
                setShowScanner(false);
              }}
            >
              ✕
            </button>
            <BarcodeScannerComponent
              ref={scannerRef}
              onScan={handleBarcodeScan}
              width={400}
              height={300}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesAdd;
