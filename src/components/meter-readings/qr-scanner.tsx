/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { QrReader } from "react-qr-reader";

interface QRScannerProps {
  onResult: (result: string) => void;
  onError?: (error: any) => void;
}

export function QRScanner({ onResult, onError }: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(true);

  // Request camera permission explicitly on component mount
  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Close the stream since we just needed it for permissions
        stream.getTracks().forEach(track => track.stop());
        setHasPermission(true);
      } catch (err) {
        console.error("Error requesting camera permission:", err);
        setHasPermission(false);
        if (onError) onError(err);
      }
    };

    requestCameraPermission();
  }, [onError]);

  const handleResult = (result: any) => {
    if (result && result.text) {
      setScanning(false);
      onResult(result.text);
    }
  };

  // Handle different permission states
  if (hasPermission === null) {
    return (
      <div className="p-4 text-center">
        <p>Requesting camera permission...</p>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Camera access denied. Please enable camera access in your browser settings.</p>
        <button 
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setHasPermission(null)} // Try requesting again
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {scanning && (
        <div className="w-full max-w-sm mx-auto overflow-hidden rounded-lg">
          <QrReader
            constraints={{ 
              facingMode: "environment",
              width: { min: 640, ideal: 1280, max: 1920 },
              height: { min: 480, ideal: 720, max: 1080 },
              aspectRatio: 1.777777778,
              frameRate: { max: 30 }
            }}
            onResult={handleResult}
            videoStyle={{ width: "100%", height: "auto" }}
            scanDelay={300}
            videoId="qr-video"
          />
        </div>
      )}
      <p className="mt-2 text-sm text-center text-muted-foreground">
        {scanning ? "Position the QR code within the frame to scan" : "QR code detected!"}
      </p>
    </div>
  );
}