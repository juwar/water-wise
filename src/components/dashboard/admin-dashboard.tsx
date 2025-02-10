"use client"

import { useState } from "react"
import { EditableReading } from "@/components/meter-readings/editable-reading"
import { UserDetailsDialog } from "@/components/users/user-details-dialog"
import { Button } from "@/components/ui/button"

interface AdminDashboardProps {
  userName: string
  role: string
  totalUsers: number
  monthlyUsage: number
  monthlyReadings: number
  averageUsagePerUser: number
  recentReadings: number
  lastWeek: Date
  usersWithStats: Array<{
    id: number
    name: string | null
    nik: string
    region: string | null
    latestReading?: {
      id: number
      meterNow: number
      meterBefore: number | null
      recordedAt: Date | null
    }
    monthlyUsage: number
    totalUsage: number
  }>
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
  usersWithStats,
}: AdminDashboardProps) {
  const [selectedUser, setSelectedUser] = useState<typeof usersWithStats[0] | null>(null)

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

          {/* Monthly Usage */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Monthly Usage</h3>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Usage</span>
                  <span className="text-2xl font-bold">{monthlyUsage.toFixed(1)} m3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Readings</span>
                  <span className="text-sm font-medium">{monthlyReadings}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Average Usage */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Average Usage</h3>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Per User</span>
                  <span className="text-2xl font-bold">{averageUsagePerUser.toFixed(1)} m3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <span className="text-sm font-medium">{new Date().toLocaleString('default', { month: 'long' })}</span>
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

        {/* Users Meter Readings Table */}
        <div className="rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Users Meter Readings</h2>
          </div>
          <div className="relative overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium">NIK</th>
                  <th className="p-4 font-medium">Region</th>
                  <th className="p-4 font-medium">Previous</th>
                  <th className="p-4 font-medium">Current</th>
                  <th className="p-4 font-medium">Monthly Usage</th>
                  <th className="p-4 font-medium">Total Usage</th>
                  <th className="p-4 font-medium">Last Update</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersWithStats.map((userStats) => {
                  const reading = userStats.latestReading;
                  return (
                    <tr key={userStats.id} className="border-t">
                      <td className="p-4">{userStats.name}</td>
                      <td className="p-4">{userStats.nik}</td>
                      <td className="p-4">{userStats.region}</td>
                      <td className="p-4">{reading?.meterBefore || 'No reading'}</td>
                      <td className="p-4">
                        {reading ? (
                          <EditableReading
                            readingId={reading.id}
                            currentValue={reading.meterNow}
                            previousValue={reading.meterBefore}
                          />
                        ) : (
                          'No reading'
                        )}
                      </td>
                      <td className="p-4">
                        {userStats.monthlyUsage > 0 ? `${userStats.monthlyUsage} m3` : 'No reading'}
                      </td>
                      <td className="p-4">
                        {userStats.totalUsage > 0 ? `${userStats.totalUsage} m3` : 'No reading'}
                      </td>
                      <td className="p-4">
                        {reading?.recordedAt 
                          ? new Date(reading.recordedAt).toLocaleDateString()
                          : 'Never'}
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
                  );
                })}
                {usersWithStats.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-4 text-center text-muted-foreground">
                      No readings recorded yet
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
