"use client";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onResult: (result: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onResult, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const [scannerStatus, setScannerStatus] = useState<'initializing' | 'ready' | 'scanning' | 'error'>('initializing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;
    
    // Initialize scanner only once
    const qrScannerId = "qr-reader-" + Math.random().toString(36).substring(2, 9);
    
    // Create the element if it doesn't exist yet
    if (!document.getElementById(qrScannerId)) {
      const qrElement = document.createElement('div');
      qrElement.id = qrScannerId;
      document.getElementById('qr-container')?.appendChild(qrElement);
    }
    
    // Safe state update function
    const safeSetState = (callback: () => void) => {
      if (isMountedRef.current) {
        callback();
      }
    };
    
    // Create scanner instance
    try {
      scannerRef.current = new Html5Qrcode(qrScannerId);
      safeSetState(() => setScannerStatus('ready'));
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      safeSetState(() => {
        setScannerStatus('error');
        setErrorMessage(errMsg);
      });
      if (onError) onError(errMsg);
      return;
    }
    
    // Only start scanning if we successfully created the scanner
    if (scannerRef.current) {
      safeSetState(() => setScannerStatus('scanning'));
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
        formatsToSupport: [1] // QR code only
      };
      
      scannerRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          // Only process if we're still mounted
          if (isMountedRef.current) {
            // First notify of the result
            onResult(decodedText);
            
            // Then try to stop the scanner (but don't depend on it being successful)
            if (scannerRef.current) {
              try {
                scannerRef.current.stop().catch(stopErr => {
                  console.warn("Error stopping scanner after scan:", stopErr);
                });
              } catch (stopErr) {
                console.warn("Exception stopping scanner after scan:", stopErr);
              }
            }
          }
        },
        (errorMessage) => {
          // Only handle non-fatal errors that don't stop scanning
          if (isMountedRef.current && errorMessage !== "QR code parse error, error = ") {
            if (onError) onError(errorMessage);
          }
        }
      ).catch((err) => {
        const errMsg = err instanceof Error ? err.message : String(err);
        safeSetState(() => {
          setScannerStatus('error');
          setErrorMessage(errMsg);
        });
        if (onError) onError(errMsg);
      });
    }
    
    // Cleanup function
    return () => {
      // Mark component as unmounted first
      isMountedRef.current = false;
      
      // Then attempt to stop the scanner
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().catch(err => {
            console.warn("Error stopping scanner during cleanup:", err);
          });
        } catch (err) {
          console.warn("Exception stopping scanner during cleanup:", err);
        } finally {
          scannerRef.current = null;
        }
      }
    };
  }, [onResult, onError]);

  return (
    <div className="relative">
      <div id="qr-container" className="w-full max-w-sm mx-auto overflow-hidden rounded-lg h-72 bg-gray-100">
        {/* Scanner will be attached here */}
      </div>
      
      {scannerStatus === 'initializing' && (
        <p className="mt-2 text-sm text-center text-muted-foreground">
          Initializing camera...
        </p>
      )}
      
      {scannerStatus === 'ready' && (
        <p className="mt-2 text-sm text-center text-muted-foreground">
          Camera ready
        </p>
      )}
      
      {scannerStatus === 'scanning' && (
        <p className="mt-2 text-sm text-center text-muted-foreground">
          Position the QR code within the frame to scan
        </p>
      )}
      
      {scannerStatus === 'error' && (
        <p className="mt-2 text-sm text-center text-red-500">
          Error: {errorMessage || "Failed to start scanner"}
        </p>
      )}
    </div>
  );
}