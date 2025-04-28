"use client"

import React, { useRef } from "react"
import QRCode from "react-qr-code"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface UserDetailsDialogProps {
  user: {
    id: number
    name: string | null
    nik: string
    region: string | null
    address: string | null
    createdAt: Date | null
    monthlyUsage?: number
    totalUsage?: number
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserDetailsDialog({
  user,
  open,
  onOpenChange,
}: UserDetailsDialogProps) {
  const qrRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    // Get QR code SVG data
    const qrSvg = qrRef.current?.querySelector('svg')
    const qrData = qrSvg ? `data:image/svg+xml;base64,${btoa(qrSvg.outerHTML)}` : ''

    // Add the content to the new window
    printWindow.document.write(`
      <html>
        <head>
          <title>User Details - ${user.name || 'User'}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              padding: 2rem;
              max-width: 800px;
              margin: 0 auto;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 2rem;
              padding-bottom: 1rem;
              border-bottom: 1px solid #eee;
            }
            .header h1 {
              margin: 0;
              font-size: 1.5rem;
              color: #111;
            }
            .timestamp {
              margin-top: 0.5rem;
              font-size: 0.875rem;
              color: #666;
            }
            .section {
              margin-bottom: 2rem;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 1.1rem;
              font-weight: 600;
              color: #111;
              margin-bottom: 1rem;
              padding-bottom: 0.5rem;
              border-bottom: 1px solid #eee;
            }
            .info-grid {
              display: grid;
              gap: 1rem;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 0.5rem;
              background: #f9f9f9;
              border-radius: 4px;
            }
            .info-label {
              font-weight: 500;
              color: #444;
            }
            .info-value {
              color: #666;
            }
            .qr-container {
              text-align: center;
              padding: 2rem;
              background: #f5f5f5;
              border-radius: 8px;
              margin: 1rem 0;
            }
            .qr-code {
              margin: 1rem auto;
              width: 200px;
              height: 200px;
              background: white;
              padding: 1rem;
              border-radius: 4px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .qr-code img {
              width: 100%;
              height: 100%;
            }
            .nik {
              margin-top: 1rem;
              font-size: 1rem;
              color: #444;
              font-weight: 500;
            }
            @media print {
              body {
                padding: 0;
              }
              .section {
                page-break-inside: avoid;
              }
              .info-row {
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>User Details</h1>
            <div class="timestamp">Generated on ${new Date().toLocaleString()}</div>
          </div>

          <div class="section">
            <div class="section-title">User Information</div>
            <div class="info-grid">
              <div class="info-row">
                <span class="info-label">User ID</span>
                <span class="info-value">${user.id}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Name</span>
                <span class="info-value">${user.name || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">NIK</span>
                <span class="info-value">${user.nik}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Region</span>
                <span class="info-value">${user.region || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Address</span>
                <span class="info-value">${user.address || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Registered At</span>
                <span class="info-value">${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">NIK QR Code</div>
            <div class="qr-container">
              <div class="qr-code">
                <img src="${qrData}" alt="QR Code" />
              </div>
              <div class="nik">NIK: ${user.nik}</div>
            </div>
          </div>
        </body>
      </html>
    `)

    // Print and close the window
    printWindow.document.close()
    printWindow.print()
    printWindow.close()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{user.name || "User Details"}</DialogTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-8 px-2"
          >
            <Printer className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline-block">Print</span>
          </Button>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-6">
            {/* User Info */}
            <div className="grid gap-2">
              <h4 className="text-sm font-medium text-muted-foreground">User Information</h4>
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Name</span>
                  <span className="text-sm text-muted-foreground">{user.name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Region</span>
                  <span className="text-sm text-muted-foreground">{user.region || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Address</span>
                  <span className="text-sm text-muted-foreground">{user.address || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Registered At</span>
                  <span className="text-sm text-muted-foreground">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* NIK QR Code */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">NIK QR Code</h4>
              <div 
                ref={qrRef}
                className="flex flex-col items-center justify-center gap-4 p-4 border rounded-lg bg-muted"
              >
                <QRCode
                  value={user.nik}
                  size={200}
                />
              </div>
            </div>

            {/* Usage Statistics */}
            {
              user.monthlyUsage !== undefined || user.totalUsage !== undefined ? (
                <div className="grid gap-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Usage Statistics</h4>
                  <div className="grid gap-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Monthly Usage</span>
                        <span className="text-sm text-muted-foreground">
                          {user.monthlyUsage} m3
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Total Usage</span>
                        <span className="text-sm text-muted-foreground">
                          {user.totalUsage} m3
                        </span>
                      </div>
                  </div>
                </div>
              ) : null
            }
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
