"use client"

import React from "react"
import QRCode from "react-qr-code"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
interface UserDetailsDialogProps {
  user: {
    id: number
    name: string | null
    nik: string
    region: string | null
    latestReading?: {
      meterNow: number
      meterBefore: number | null
      recordedAt: Date | null
    }
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user.name || "User Details"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
              </div>
            </div>

            {/* NIK QR Code */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">NIK QR Code</h4>
              <div className="flex flex-col items-center justify-center gap-4 p-4 border rounded-lg bg-muted">
                <QRCode
                  value={user.nik}
                  size={200}
                />
                <p className="text-sm text-muted-foreground">NIK: {user.nik}</p>
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="grid gap-2">
              <h4 className="text-sm font-medium text-muted-foreground">Usage Statistics</h4>
              <div className="grid gap-2">
                {user.monthlyUsage !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Monthly Usage</span>
                    <span className="text-sm text-muted-foreground">
                      {user.monthlyUsage} m3
                    </span>
                  </div>
                )}
                {user.totalUsage !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Total Usage</span>
                    <span className="text-sm text-muted-foreground">
                      {user.totalUsage} m3
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
