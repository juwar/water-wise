"use client"

import { useState } from "react"
import { UserDetailsDialog } from "@/components/users/user-details-dialog"
import { Button } from "@/components/ui/button"
import { EditableMeter } from "@/components/meter-readings/editable-meter"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface UserStats {
  id: number
  name: string | null
  nik: string
  region: string | null
  address: string | null
  createdAt: Date | null
  monthlyUsage: number
  totalUsage: number
  readingId: number | null
  meterNow: number | null
  meterBefore: number | null
  recordedAt: Date | null
}

interface AdminDashboardProps {
  userName: string
  role: string
  totalUsers: number
  monthlyUsage: number
  monthlyReadings: number
  averageUsagePerUser: number
  recentReadings: number
  lastWeek: Date
  waterPricePerM3: number
  usersWithStats: Array<UserStats>
}

export function AdminDashboard({
  userName,
  role,
  totalUsers,
  monthlyUsage,
  monthlyReadings,
  averageUsagePerUser,
  recentReadings,
  lastWeek,
  waterPricePerM3,
  usersWithStats,
}: AdminDashboardProps) {
  const router = useRouter()
  const [selectedUser, setSelectedUser] = useState<typeof usersWithStats[0] | null>(null)
  const getUsage = (user: UserStats) => user.meterNow && user.meterBefore
    ? user.meterNow - user.meterBefore
    : user.meterNow || 0

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {role === "admin" ? "Admin" : "Officer"} Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {userName}
          </p>
        </div>

        {/* Admin Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Users */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Total Users</h3>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Users</span>
                  <span className="text-2xl font-bold">{totalUsers}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Water Price */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Water Price</h3>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Current Rate</span>
                  <span className="text-2xl font-bold">Rp {waterPricePerM3.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Per Cubic Meter</span>
                  <span className="text-sm font-medium">m³</span>
                </div>
              </div>
            </div>
          </div>

          {/* Water Usage Statistics */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline">
                <h3 className="text-lg font-medium">Water Usage</h3>
                <span className="text-sm font-medium">({new Date().toLocaleString('default', { month: 'long' })})</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total This Month</span>
                  <span className="text-2xl font-bold">{monthlyUsage.toFixed(1)} m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Average Per User</span>
                  <span className="text-sm font-medium">{averageUsagePerUser.toFixed(1)} m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Readings</span>
                  <span className="text-sm font-medium">{monthlyReadings}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Recent Activity</h3>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">New Readings</span>
                  <span className="text-2xl font-bold">{recentReadings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last 7 Days</span>
                  <span className="text-sm font-medium">{lastWeek.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Users List */}
        <div className="rounded-lg border">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Record List</h2>
            <Button asChild>
              <Link href="/record">+ New Record</Link>
            </Button>
          </div>
          <div className="relative overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium">NIK</th>
                  <th className="p-4 font-medium">Region</th>
                  <th className="p-4 font-medium">Previous Reading</th>
                  <th className="p-4 font-medium">Current Reading</th>
                  <th className="p-4 font-medium">Usage</th>
                  <th className="p-4 font-medium">Bill</th>
                  <th className="p-4 font-medium">Recorded At</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersWithStats.map((userStats) => (
                  <tr key={userStats.id} className="border-t">
                    <td className="p-4">{userStats.name}</td>
                    <td className="p-4">{userStats.nik}</td>
                    <td className="p-4">{userStats.region}</td>
                    <td className="p-4">{`${userStats.meterBefore || userStats.meterNow} m³`}</td>
                    <td className="p-4">
                      <EditableMeter
                        readingId={userStats.readingId!}
                        currentValue={userStats.meterNow}
                        previousValue={userStats.meterBefore}
                        isAdmin={role === "admin"}
                        onUpdate={() => router.refresh()}
                      />
                    </td>
                    <td className="p-4">
                      {`${getUsage(userStats)} m³`|| "N/A"}
                    </td>
                    <td className="p-4">
                      {`Rp ${((getUsage(userStats)) * waterPricePerM3).toLocaleString()}` || "N/A"}
                    </td>
                    <td className="p-4">
                      {userStats.recordedAt
                        ? new Date(userStats.recordedAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="p-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(userStats)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
                {usersWithStats.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-4 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Details Dialog */}
      {selectedUser && (
        <UserDetailsDialog
          user={selectedUser}
          open={!!selectedUser}
          onOpenChange={(open) => !open && setSelectedUser(null)}
        />
      )}
    </div>
  )
}
