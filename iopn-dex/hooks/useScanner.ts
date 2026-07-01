"use client";

import { useEffect, useRef, useState } from "react";

type ScannerResult = string | null;

export function useScanner(onScan: (value: string) => void) {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<any>(null);

  // Start scanner
  const startScanner = async () => {
    setIsScanning(true);

    const { Html5QrcodeScanner } = await import("html5-qrcode");

    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: 250,
        aspectRatio: 1,
      },
      false
    );

    scannerRef.current.render(
      (text: string) => {
        onScan(text);        // send scanned value to Pay page
        stopScanner();       // auto stop after scan
      },
      (error: any) => {
        console.log("QR scan error:", error);
      }
    );
  };

  // Stop scanner
  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return {
    startScanner,
    stopScanner,
    isScanning,
  };
}