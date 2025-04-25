"use client";

import { useState } from "react";
import { UserDetailsDialog } from "@/components/users/user-details-dialog";
import { Button } from "@/components/ui/button";
import { EditableMeter } from "@/components/meter-readings/editable-meter";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, CreditCard, Activity } from "lucide-react";

interface UserStats {
  id: number;
  name: string | null;
  nik: string;
  region: string | null;
  address: string | null;
  createdAt: Date | null;
  monthlyUsage: number;
  totalUsage: number;
  readingId: number | null;
  meterNow: number | null;
  meterBefore: number | null;
  recordedAt: Date | null;
}

interface AdminDashboardProps {
  userName: string;
  role: string;
  totalUsers: number;
  monthlyUsage: number;
  monthlyReadings: number;
  averageUsagePerUser: number;
  recentReadings: number;
  lastWeek: Date;
  waterPricePerM3: number;
  usersWithStats: Array<UserStats>;
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
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<
    (typeof usersWithStats)[0] | null
  >(null);
  const getUsage = (user: UserStats) =>
    user.meterNow && user.meterBefore
      ? user.meterNow - user.meterBefore
      : user.meterNow || 0;

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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Users Card */}
          <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-blue-800">
                  Total Pengguna
                </h3>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-blue-600">Pengguna Aktif</span>
                  <span className="text-3xl font-bold text-blue-800">
                    {totalUsers}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Water Price Card */}
          <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-emerald-800">
                  Harga Air
                </h3>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-emerald-600">
                    Tarif Saat Ini
                  </span>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-emerald-800">
                      Rp {waterPricePerM3.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-emerald-600">
                    Per Meter Kubik
                  </span>
                  <span className="text-xs px-2 py-1 bg-emerald-200 text-emerald-700 font-medium rounded-full">
                    m³
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Water Usage Card */}
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-indigo-100 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-indigo-800">
                  Penggunaan Air
                </h3>
                <span className="text-xs text-indigo-600 px-2 py-1 bg-indigo-200 rounded-full">
                  ({new Date().toLocaleString("default", { month: "long" })})
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-indigo-600">
                    Total Bulan Ini
                  </span>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-indigo-800">
                      {monthlyUsage.toFixed(1)}
                    </span>
                    <span className="ml-1 text-xs text-indigo-600">m³</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-indigo-600">
                    Rata-Rata Per Pengguna
                  </span>
                  <div className="flex items-baseline">
                    <span className="text-sm font-medium text-indigo-800">
                      {averageUsagePerUser.toFixed(1)}
                    </span>
                    <span className="ml-1 text-xs text-indigo-600">m³</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-indigo-600">
                    Total Pembacaan
                  </span>
                  <span className="text-sm font-medium text-indigo-800">
                    {monthlyReadings}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-amber-100 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-amber-800">
                  Aktivitas Terbaru
                </h3>
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Activity className="h-5 w-5 text-amber-600" />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-amber-600">Pembacaan Baru</span>
                  <span className="text-3xl font-bold text-amber-800">
                    {recentReadings}
                  </span>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-amber-600">
                    7 Hari Terakhir
                  </span>
                  <span className="text-sm font-medium text-amber-800">
                    {lastWeek.toLocaleDateString()}
                  </span>
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
                    <td className="p-4">{`${
                      userStats.meterBefore || userStats.meterNow
                    } m³`}</td>
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
                      {`Rp ${(
                        getUsage(userStats) * waterPricePerM3
                      ).toLocaleString()}` || "N/A"}
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
                    <td
                      colSpan={9}
                      className="p-4 text-center text-muted-foreground"
                    >
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
  );
}
