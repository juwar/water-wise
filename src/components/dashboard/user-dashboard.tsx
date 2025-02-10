"use client"

import { UserReading } from "@/types/dashboard"

interface UserDashboardProps {
  userName: string
  userNik: string
  userRegion: string | null
  userAddress: string
  userCreatedAt: Date
  latestReading: UserReading | null
  previousReading: UserReading | null
  totalReadings: number
  totalUsage: number
  averageUsage: number
  currentUsage: number
  usageTrend: number
  userReadings: UserReading[]
}

export function UserDashboard({
  userName,
  userNik,
  userRegion,
  latestReading,
  totalReadings,
  totalUsage,
  averageUsage,
  currentUsage,
  usageTrend,
  userReadings,
}: UserDashboardProps) {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {userName}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Account Info */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Account Information</h3>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Name</span>
                  <span className="text-sm font-medium">{userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">NIK</span>
                  <span className="text-sm font-medium">{userNik}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Region</span>
                  <span className="text-sm font-medium">{userRegion || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Reading */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Latest Reading</h3>
              {latestReading ? (
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current</span>
                    <span className="text-sm font-medium">{latestReading.meterNow} m3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Previous</span>
                    <span className="text-sm font-medium">{latestReading.meterBefore || 0} m3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Usage</span>
                    <span className="text-sm font-medium">{currentUsage} m3</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No readings recorded yet</p>
              )}
            </div>
          </div>

          {/* Average Usage */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Average Usage</h3>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Average</span>
                  <span className="text-sm font-medium">{averageUsage.toFixed(2)} m3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Trend</span>
                  <span className={`text-sm font-medium ${usageTrend < 0 ? "text-green-500" : usageTrend > 0 ? "text-red-500" : ""}`}>
                    {usageTrend !== 0 ? `${usageTrend > 0 ? "+" : ""}${usageTrend.toFixed(2)} m3` : "No change"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Usage */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Total Usage</h3>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-sm font-medium">{totalUsage.toFixed(2)} m3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Readings</span>
                  <span className="text-sm font-medium">{totalReadings}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Readings History Table */}
        <div className="rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Reading History</h2>
          </div>
          <div className="relative overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Previous Reading</th>
                  <th className="p-4 font-medium">Current Reading</th>
                  <th className="p-4 font-medium">Usage</th>
                  <th className="p-4 font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {userReadings.map((reading, index) => {
                  const usage = reading.meterNow - (reading.meterBefore || 0);
                  const prevReading = userReadings[index + 1];
                  const prevUsage = prevReading 
                    ? prevReading.meterNow - (prevReading.meterBefore || 0)
                    : null;
                  const change = prevUsage !== null ? usage - prevUsage : null;

                  return (
                    <tr key={reading.id} className="border-t">
                      <td className="p-4">
                        {reading.recordedAt?.toLocaleDateString() || 'N/A'}
                      </td>
                      <td className="p-4">
                        {reading.meterBefore ? `${reading.meterBefore} m3` : '0 m3'}
                      </td>
                      <td className="p-4">{reading.meterNow} m3</td>
                      <td className="p-4">{usage} m3</td>
                      <td className="p-4">
                        {change !== null ? (
                          <span className={change < 0 ? "text-green-500" : change > 0 ? "text-red-500" : ""}>
                            {change > 0 ? "+" : ""}{change} m3
                          </span>
                        ) : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
                {userReadings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                      No readings recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
