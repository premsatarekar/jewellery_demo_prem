import React from 'react';
import Barcode from 'react-barcode';

const BarcodeComponent = ({ value = '', style = { marginTop: '5px' } }) => {
  return (
    <div style={style} aria-label={value ? `Barcode for ${value}` : 'No barcode'}>
      {value ? <Barcode value={value} height={50} /> : null}
    </div>
  );
};

export default BarcodeComponent;
