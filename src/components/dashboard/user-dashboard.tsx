"use client"

import { UserReading } from "@/types/dashboard"

interface UserDashboardProps {
  userName: string
  userNik: string
  userRegion: string | null
  userAddress: string | null
  userCreatedAt: Date | null
  latestReading: UserReading | null
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
  userAddress,
  userCreatedAt,
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
          <h1 className="text-3xl font-bold tracking-tight">Dasbor</h1>
          <p className="text-muted-foreground">
            Selamat datang kembali, {userName}
          </p>
        </div>

        {/* Statistik */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Info Akun */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Informasi Akun</h3>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Nama</span>
                  <span className="text-sm font-medium">{userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">NIK</span>
                  <span className="text-sm font-medium">{userNik}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Wilayah</span>
                  <span className="text-sm font-medium">{userRegion || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Alamat</span>
                  <span className="text-sm font-medium">{userAddress || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Terdaftar Sejak</span>
                  <span className="text-sm font-medium">
                    {userCreatedAt ? new Date(userCreatedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pembacaan Terbaru */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Pembacaan Terbaru</h3>
              {latestReading ? (
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Sekarang</span>
                    <span className="text-sm font-medium">{latestReading.meterNow} m3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Sebelumnya</span>
                    <span className="text-sm font-medium">{latestReading.meterBefore || 0} m3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Pemakaian</span>
                    <span className="text-sm font-medium">{currentUsage} m3</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada pembacaan tercatat</p>
              )}
            </div>
          </div>

          {/* Rata-rata Pemakaian */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Rata-rata Pemakaian</h3>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Rata-rata Bulanan</span>
                  <span className="text-sm font-medium">{averageUsage.toFixed(2)} m3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Perubahan</span>
                  <span className={`text-sm font-medium ${usageTrend < 0 ? "text-green-500" : usageTrend > 0 ? "text-red-500" : ""}`}>
                    {usageTrend !== 0 ? `${usageTrend > 0 ? "+" : ""}${usageTrend.toFixed(2)} m3` : "Tidak ada perubahan"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Pemakaian */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Total Pemakaian</h3>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-sm font-medium">{totalUsage.toFixed(2)} m3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Jumlah Pembacaan</span>
                  <span className="text-sm font-medium">{totalReadings}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Riwayat Pembacaan */}
        <div className="rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Riwayat Pembacaan</h2>
          </div>
          <div className="relative overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-4 font-medium">Tanggal</th>
                  <th className="p-4 font-medium">Pembacaan Sebelumnya</th>
                  <th className="p-4 font-medium">Pembacaan Sekarang</th>
                  <th className="p-4 font-medium">Pemakaian</th>
                  <th className="p-4 font-medium">Perubahan</th>
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
                      Belum ada pembacaan tercatat
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
