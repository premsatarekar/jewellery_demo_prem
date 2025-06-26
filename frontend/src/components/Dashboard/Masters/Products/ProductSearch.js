import React, { useState } from 'react';
import BarcodeScanner from './BarcodeScanner';
import axios from 'axios';
import './ProductSearch.css'; // optional CSS

const ProductSearch = () => {
  const [scannedCode, setScannedCode] = useState('');
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  const handleScanSuccess = async (decodedText) => {
    const code = decodedText.trim();
    setScannedCode(code);

    try {
      const res = await axios.get(`http://localhost:5000/api/products/barcode/${code}`);
      setProduct(res.data);
      setError('');
    } catch (err) {
      setProduct(null);
      setError(err.response?.data?.message || 'Product not found');
    }
  };

  return (
    <div className="product-search">
      <h2>Scan Product Barcode</h2>
      <BarcodeScanner onScanSuccess={handleScanSuccess} />

      <div style={{ marginTop: '20px' }}>
        <p><strong>Scanned Code:</strong> {scannedCode}</p>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {product && (
          <div className="product-card">
            <h3>{product.product_name}</h3>
            <p><strong>Category:</strong> {product.category}</p>
            <p><strong>Karat:</strong> {product.karat}</p>
            <p><strong>Weight:</strong> {product.weight} {product.unit}</p>
            <p><strong>Price:</strong> ₹{product.price}</p>
            <p><strong>Barcode:</strong> {product.barcode}</p>
            <p><strong>HSN:</strong> {product.hsn}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSearch;
