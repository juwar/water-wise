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
            {role === "admin" ? "Dashboard Admin" : "Dashboard Petugas"}
          </h1>
          <p className="text-muted-foreground">
            Selamat datang kembali, {userName}
          </p>
        </div>

        {/* Admin Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Users */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Total Pengguna</h3>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pengguna Aktif</span>
                  <span className="text-2xl font-bold">{totalUsers}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Water Price */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Harga Air</h3>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tarif Saat Ini</span>
                  <span className="text-2xl font-bold">Rp {waterPricePerM3.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Per Meter Kubik</span>
                  <span className="text-sm font-medium">m³</span>
                </div>
              </div>
            </div>
          </div>

          {/* Water Usage Statistics */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline">
                <h3 className="text-lg font-medium">Penggunaan Air</h3>
                <span className="text-sm font-medium">({new Date().toLocaleString('default', { month: 'long' })})</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Bulan Ini</span>
                  <span className="text-2xl font-bold">{monthlyUsage.toFixed(1)} m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Rata-Rata Per Pengguna</span>
                  <span className="text-sm font-medium">{averageUsagePerUser.toFixed(1)} m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Pembacaan</span>
                  <span className="text-sm font-medium">{monthlyReadings}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Aktivitas Terbaru</h3>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pembacaan Baru</span>
                  <span className="text-2xl font-bold">{recentReadings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">7 Hari Terakhir</span>
                  <span className="text-sm font-medium">{lastWeek.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Users List */}
        <div className="rounded-lg border">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Daftar Rekaman</h2>
            <Button asChild>
              <Link href="/record">+ Rekam Baru</Link>
            </Button>
          </div>
          <div className="relative overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-4 font-medium">Pengguna</th>
                  <th className="p-4 font-medium">NIK</th>
                  <th className="p-4 font-medium">Wilayah</th>
                  <th className="p-4 font-medium">Pembacaan Sebelumnya</th>
                  <th className="p-4 font-medium">Pembacaan Sekarang</th>
                  <th className="p-4 font-medium">Penggunaan</th>
                  <th className="p-4 font-medium">Tagihan</th>
                  <th className="p-4 font-medium">Tanggal Pembacaan</th>
                  <th className="p-4 font-medium">Tindakan</th>
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
                      {`${getUsage(userStats)} m³` || "N/A"}
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
                        Lihat Detail
                      </Button>
                    </td>
                  </tr>
                ))}
                {usersWithStats.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-4 text-center text-muted-foreground">
                      Tidak ada pengguna ditemukan
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
