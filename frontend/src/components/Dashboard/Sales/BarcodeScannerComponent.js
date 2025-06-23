import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

const BarcodeScannerComponent = forwardRef(({ onScan, width = 400, height = 300 }, ref) => {
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const scannedCodeRef = useRef(null);

  // Expose control methods to parent via ref
  useImperativeHandle(ref, () => ({
    startScanning() {
      if (!scanning) {
        setScanning(true);
      }
    },
    stopScanning() {
      stopCamera();
    },
  }));

  const stopCamera = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }

    const stream = videoRef.current?.srcObject;
    stream?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    scannedCodeRef.current = null;
    setScanning(false);
  };

  useEffect(() => {
    if (!scanning) return;

    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    codeReader
      .decodeFromVideoDevice(null, videoRef.current, (result, err) => {
        if (result) {
          const text = result.getText();
          if (text && text !== scannedCodeRef.current) {
            scannedCodeRef.current = text;
            onScan(text);
          }
        } else if (err && err.name !== "NotFoundException") {
          console.error("Scanner error:", err);
        }
      })
      .catch((err) => {
        console.error("Error initializing barcode scanner:", err);
      });

    return () => stopCamera();
  }, [scanning, onScan]);

  if (!scanning) return null;

  return (
    <div
      style={{
        width,
        height,
        border: "1px solid #ccc",
        borderRadius: 8,
        backgroundColor: "#000",
        overflow: "hidden",
      }}
    >
      <video
        ref={videoRef}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        muted
        playsInline
        autoPlay
      />
    </div>
  );
});

export default BarcodeScannerComponent;
