import React, { useState } from 'react';
import BarcodeScanner from './BarcodeScanner';

const ProductSearch = () => {
  const [scannedCode, setScannedCode] = useState('');

  const handleScanSuccess = (decodedText) => {
    setScannedCode(decodedText);
    // Optionally, search or fetch product by barcode
    alert(`Scanned Code: ${decodedText}`);
  };

  return (
    <div>
      <BarcodeScanner onScanSuccess={handleScanSuccess} />
      <p>Scanned: {scannedCode}</p>
    </div>
  );
};

export default ProductSearch;
