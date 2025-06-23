import React from 'react';
import { useParams } from 'react-router-dom';
import './CustomerDetails.css'; 

const CustomerDetails = ({ sales }) => {
  const { customerName } = useParams(); // Get the customer name from the URL params
  const customerPayments = sales.filter((sale) => sale.customerName === customerName);

  return (
    <div className="sales-card">
      <h2 className="text-xl font-bold mb-4">{customerName}'s Payment Details</h2>

      <table className="min-w-full border">
        <thead>
          <tr>
            <th>SR No.</th>
            <th>Invoice Number</th>
            <th>Bill Amount</th>
            <th>Amount Paid</th>
            <th>Balance</th>
            <th>Mode</th>
            <th>Payment ID</th>
          </tr>
        </thead>
        <tbody>
          {customerPayments.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">
                No payments found for {customerName}
              </td>
            </tr>
          ) : (
            customerPayments.map((payment, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{payment.invoiceNumber}</td>
                <td>{payment.billAmount}</td>
                <td>{payment.amountPaid}</td>
                <td>{payment.balance}</td>
                <td>{payment.mode}</td>
                <td>{payment.paymentId}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerDetails;
