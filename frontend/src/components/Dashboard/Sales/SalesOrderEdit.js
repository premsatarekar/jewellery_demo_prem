// SalesOrderEdit.js (backend‑connected)
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./SalesOrderEdit.css";

const BASE = process.env.REACT_APP_API_BASE_URL;
const API = `${BASE}/api/sales`;

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
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const emptyItem = {
  itemName: "",
  weight: "",
  quantity: "",
  cost: "",
  makingCharges: "",
  amount: "0.00",
  barcode: "",
};

const SalesOrderEdit = () => {
  const { invoiceNumber } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    customerName: "",
    invoiceDate: "",
    paymentMode: "",
    state: "",
    amountPaid: "",
    taxPercent: "",
    discountPercent: "",
    items: [emptyItem],
  });

  /* ---------------- Fetch existing order ---------------- */
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`${API}/${invoiceNumber}`);
        setFormData({
          customerName: data.customer_name || "",
          invoiceDate: data.invoice_date?.slice(0, 10) || "",
          paymentMode: data.payment_mode || "",
          state: data.state || "",
          amountPaid: data.amount_paid || "",
          taxPercent: data.tax_percent || "",
          discountPercent: data.discount_percent || "",
          items: (data.items || []).map((it) => ({
            itemName: it.item_name,
            weight: it.weight || "",
            quantity: it.quantity,
            cost: it.cost,
            makingCharges: it.making_pct,
            amount: Number(it.amount).toFixed(2),
            barcode: it.barcode || "",
          })),
        });
      } catch (err) {
        console.error(err);
        setError("Unable to fetch invoice");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [invoiceNumber]);

  /* ---------------- Handlers ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (idx, field, value) => {
    const updated = [...formData.items];
    updated[idx][field] = value;

    // recalc amount
    const q = parseFloat(updated[idx].quantity || 0);
    const c = parseFloat(updated[idx].cost || 0);
    const mc = parseFloat(updated[idx].makingCharges || 0);
    const amt = (c + (c * mc) / 100) * q;
    updated[idx].amount = isNaN(amt) ? "0.00" : amt.toFixed(2);

    setFormData((prev) => ({ ...prev, items: updated }));
  };

  const addLineItem = () =>
    setFormData((p) => ({ ...p, items: [...p.items, { ...emptyItem }] }));

  const removeLineItem = (idx) =>
    setFormData((p) => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));

  /* ---------------- totals ---------------- */
  const calcTotals = () => {
    const subTotal = formData.items.reduce(
      (a, it) => a + parseFloat(it.amount || 0),
      0
    );
    const disc = subTotal * (parseFloat(formData.discountPercent || 0) / 100);
    const taxable = subTotal - disc;
    const taxAmt = taxable * (parseFloat(formData.taxPercent || 0) / 100);
    return (taxable + taxAmt).toFixed(2);
  };

  /* ---------------- update ---------------- */
  const handleUpdate = async () => {
    try {
      const subTotal = formData.items.reduce(
        (a, it) => a + parseFloat(it.amount || 0),
        0
      );
      const discount =
        subTotal * (parseFloat(formData.discountPercent || 0) / 100);
      const taxable = subTotal - discount;
      const tax = taxable * (parseFloat(formData.taxPercent || 0) / 100);
      const total = taxable + tax;

      const payload = {
        order: {
          customer_name: formData.customerName,
          invoice_date: formData.invoiceDate,
          payment_mode: formData.paymentMode,
          state: formData.state,
          amount_paid: Number(formData.amountPaid),
          tax_percent: Number(formData.taxPercent),
          discount_percent: Number(formData.discountPercent || 0),
          sub_total: subTotal.toFixed(2),
          total: total.toFixed(2),
          utr_number: formData.utrNumber || "",
          cheque_no: formData.chequeNumber || "",
        },
        items: formData.items.map((it) => ({
          itemName: it.itemName,
          weight: it.weight || null,
          quantity: Number(it.quantity || 0),
          cost: Number(it.cost || 0),
          makingCharges: Number(it.makingCharges || 0),
          amount: Number(it.amount || 0),
          barcode: it.barcode || null,
        })),
      };

      await axios.put(`${API}/${invoiceNumber}`, payload);
      alert("Invoice updated successfully ✅");
      navigate("/dashboard/sales/list");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Update failed ❌");
    }
  };

  /* ---------------- UI ---------------- */
  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-danger">{error}</p>;

  return (
    <div className="sales-edit-container">
      <h2 className="title">Edit Sales Order</h2>

      <div className="form-grid">
        <div>
          <label>Customer Name</label>
          <input
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Invoice Date</label>
          <input
            type="date"
            name="invoiceDate"
            value={formData.invoiceDate}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Payment Mode</label>
          <select
            name="paymentMode"
            value={formData.paymentMode}
            onChange={handleChange}
          >
            <option value="">Select Mode</option>
            <option value="Cash">Cash</option>
            <option value="Online">Online</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>
        <div>
          <label>State</label>
          <select name="state" value={formData.state} onChange={handleChange}>
            <option value="">Select State</option>
            {indianStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Amount Paid</label>
          <input
            name="amountPaid"
            type="number"
            value={formData.amountPaid}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Tax (%)</label>
          <input
            name="taxPercent"
            type="number"
            value={formData.taxPercent}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Discount (%)</label>
          <input
            name="discountPercent"
            type="number"
            value={formData.discountPercent}
            onChange={handleChange}
          />
        </div>
      </div>

      <h5 className="mt-4">Product Details</h5>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Item</th>
              <th>Weight</th>
              <th>Qty</th>
              <th>Cost</th>
              <th>MC (%)</th>
              <th>Amount</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {formData.items.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <input
                    value={item.itemName}
                    onChange={(e) =>
                      handleItemChange(idx, "itemName", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    value={item.weight}
                    onChange={(e) =>
                      handleItemChange(idx, "weight", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(idx, "quantity", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    value={item.cost}
                    onChange={(e) =>
                      handleItemChange(idx, "cost", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    value={item.makingCharges}
                    onChange={(e) =>
                      handleItemChange(idx, "makingCharges", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input value={item.amount} readOnly />
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeLineItem(idx)}
                  >
                    -
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="btn btn-success mb-3" onClick={addLineItem}>
        + Add Line Item
      </button>

      <div className="total-section">
        <label>Total</label>
        <input value={calcTotals()} readOnly />
      </div>

      <div className="button-group">
        <button className="btn btn-primary" onClick={handleUpdate}>
          Update Sales
        </button>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SalesOrderEdit;
