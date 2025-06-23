import React, { useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const BarcodeScanner = ({ onScanSuccess, onClose }) => {
  const html5QrCodeRef = useRef(null);
  const isScanningRef = useRef(false);

  // ✅ Use useCallback so it's safe to use in useEffect
  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current && isScanningRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
        isScanningRef.current = false;
        onClose();
      } catch (err) {
        console.warn("Error stopping scanner:", err);
      }
    }
  }, [onClose]);

  useEffect(() => {
    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        html5QrCodeRef.current = html5QrCode;

        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          const cameraId = devices[0].id;

          await html5QrCode.start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 }
            },
            (decodedText) => {
              if (!isScanningRef.current) return;
              onScanSuccess(decodedText);
              stopScanner();
            },
            (errorMessage) => {
              // Handle scan error if needed
            }
          );

          isScanningRef.current = true;
        }
      } catch (err) {
        console.error("Camera access or scanner error:", err);
      }
    };

    startScanner();

    return () => {
      stopScanner(); // cleanup when component unmounts
    };
  }, [onScanSuccess, stopScanner]);

  return (
    <div style={{ textAlign: 'center' }}>
      <div id="reader" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}></div>
      <button onClick={stopScanner} style={{ marginTop: '10px', padding: '6px 12px' }}>
        Close Scanner
      </button>
    </div>
  );
};

export default BarcodeScanner;
