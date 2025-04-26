"use client";

import { UserReading } from "@/types/dashboard";
import { User, Droplet, TrendingUp, BarChart3 } from "lucide-react";

interface UserDashboardProps {
  userName: string;
  userNik: string;
  userRegion: string | null;
  userAddress: string | null;
  userCreatedAt: Date | null;
  latestReading: UserReading | null;
  totalReadings: number;
  totalUsage: number;
  averageUsage: number;
  currentUsage: number;
  usageTrend: number;
  userReadings: UserReading[];
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Selamat datang kembali, {userName}
          </p>
        </div>

        {/* Statistik */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Info Akun */}
          <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-blue-800">
                  Informasi Akun
                </h3>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-blue-600">Nama</span>
                  <span className="text-sm font-medium text-blue-800">
                    {userName}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-blue-600">NIK</span>
                  <span className="text-sm font-medium text-blue-800">
                    {userNik}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-blue-600">Wilayah</span>
                  <span className="text-sm font-medium text-blue-800">
                    {userRegion || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-blue-600">Alamat</span>
                  <span className="text-sm font-medium text-blue-800">
                    {userAddress || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-blue-600">Terdaftar Sejak</span>
                  <span className="text-sm font-medium text-blue-800">
                    {userCreatedAt
                      ? new Date(userCreatedAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pembacaan Terbaru */}
          <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-emerald-800">
                  Pembacaan Terbaru
                </h3>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Droplet className="h-5 w-5 text-emerald-600" />
                </div>
              </div>

              {latestReading ? (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-emerald-600">Sekarang</span>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-emerald-800">
                        {latestReading.meterNow}
                      </span>
                      <span className="ml-1 text-xs text-emerald-800">m³</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-emerald-600">Sebelumnya</span>
                    <div className="flex items-baseline">
                      <span className="text-sm font-bold text-emerald-800">
                        {latestReading.meterBefore || 0}
                      </span>
                      <span className="ml-1 text-xs text-emerald-800">m³</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-emerald-600">Pemakaian</span>
                    <div className="flex items-baseline">
                      <span className="text-sm font-bold text-emerald-800">
                        {currentUsage}
                      </span>
                      <span className="ml-1 text-xs text-emerald-800">m³</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-lg text-emerald-600">
                  Belum ada pembacaan tercatat
                </p>
              )}
            </div>
          </div>

          {/* Rata-rata Pemakaian */}
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-indigo-100 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-indigo-800">
                  Rata-rata Pemakaian
                </h3>
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-indigo-600">
                    Rata-rata Bulanan
                  </span>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-indigo-800">
                      {averageUsage.toFixed(2)}
                    </span>
                    <span className="ml-1 text-xs text-indigo-600">m³</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-indigo-600">Perubahan</span>
                  <div className="flex items-baseline">
                    <span
                      className={`text-sm font-bold ${
                        usageTrend < 0 ? "text-indigo-800" : "text-red-500"
                      }`}
                    >
                      {usageTrend !== 0
                        ? `${usageTrend > 0 ? "+" : ""}${usageTrend.toFixed(2)}`
                        : "Tidak ada perubahan"}
                    </span>
                    <span className={`ml-1 text-xs text-indigo-600 ${
                        usageTrend < 0 ? "text-indigo-800" : "text-red-500"
                      }`}>
                      {usageTrend > 0 ? "m³" : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Pemakaian */}
          <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-amber-100 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-amber-800">
                  Total Pemakaian
                </h3>
                <div className="p-2 bg-amber-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-amber-600" />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-amber-600">Total</span>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-amber-800">
                      {totalUsage.toFixed(2)}
                    </span>
                    <span className="ml-1 text-xs text-amber-800">m³</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-amber-600">
                    Jumlah Pembacaan
                  </span>
                  <span className="text-sm font-medium text-amber-800">
                    {totalReadings}
                  </span>
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
                        {reading.recordedAt?.toLocaleDateString() || "N/A"}
                      </td>
                      <td className="p-4">
                        {reading.meterBefore
                          ? `${reading.meterBefore} m3`
                          : "0 m3"}
                      </td>
                      <td className="p-4">{reading.meterNow} m3</td>
                      <td className="p-4">{usage} m3</td>
                      <td className="p-4">
                        {change !== null ? (
                          <span
                            className={
                              change < 0
                                ? "text-green-500"
                                : change > 0
                                ? "text-red-500"
                                : ""
                            }
                          >
                            {change > 0 ? "+" : ""}
                            {change} m3
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                    </tr>
                  );
                })}
                {userReadings.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-4 text-center text-muted-foreground"
                    >
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
  );
}
