"use client";

import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onResult: (result: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onResult, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // Initialize scanner
    scannerRef.current = new Html5Qrcode("qr-reader");

    // Start scanning
    scannerRef.current
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Stop scanning after successful scan
          if (scannerRef.current) {
            scannerRef.current.stop().then(() => {
              onResult(decodedText);
            });
          }
        },
        (errorMessage) => {
          onError?.(errorMessage);
        }
      )
      .catch((err) => {
        onError?.(err?.message || "Failed to start scanner");
      });

    // Cleanup
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [onResult, onError]);

  return (
    <div className="relative">
      <div id="qr-reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-lg" />
      <p className="mt-2 text-sm text-center text-muted-foreground">
        Position the QR code within the frame to scan
      </p>
    </div>
  );
}
