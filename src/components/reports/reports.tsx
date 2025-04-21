"use client";

import { useState } from "react";
// import { useRouter } from "next/navigation";
import {
  Calendar,
  FileText,
  Filter,
  Download,
  ChevronDown,
  Search,
} from "lucide-react";

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

export function Reports({
  // role,
  // totalUsers,
  monthlyUsage,
  // monthlyReadings,
  // averageUsagePerUser,
  // recentReadings,
  // lastWeek,
  waterPricePerM3,
  usersWithStats,
}: AdminDashboardProps) {
  // const router = useRouter();
  // const [selectedUser, setSelectedUser] = useState<
  //   (typeof usersWithStats)[0] | null
  // >(null);
  const getUsage = (user: UserStats) =>
    user.meterNow && user.meterBefore
      ? user.meterNow - user.meterBefore
      : user.meterNow || 0;
  const [activeTab, setActiveTab] = useState("meter");
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);

  const years = [2025, 2024, 2023];
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const regions = ["Semua Wilayah", "Region 1", "Region 2", "Region 3"];

  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState("April");
  const [selectedRegion, setSelectedRegion] = useState("Semua Wilayah");

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-7xl">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Laporan</h1>
              <p className="text-gray-500">Laporan data meteran dan keuangan</p>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("meter")}
                    className={`px-6 py-4 ${
                      activeTab === "meter"
                        ? "text-blue-500 border-b-2 border-blue-500 font-medium"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <FileText size={18} />
                      <span>Laporan Meteran</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("finance")}
                    className={`px-6 py-4 ${
                      activeTab === "finance"
                        ? "text-blue-500 border-b-2 border-blue-500 font-medium"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <FileText size={18} />
                      <span>Laporan Keuangan</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Filter Controls */}
              <div className="p-4 bg-gray-50 border-b">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Year Filter */}
                  <div className="relative">
                    <button
                      onClick={() => setShowYearDropdown(!showYearDropdown)}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center space-x-2 text-sm"
                    >
                      <Calendar size={16} />
                      <span>Tahun: {selectedYear}</span>
                      <ChevronDown size={16} />
                    </button>
                    {showYearDropdown && (
                      <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg w-40">
                        {years.map((year) => (
                          <button
                            key={year}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            onClick={() => {
                              setSelectedYear(year);
                              setShowYearDropdown(false);
                            }}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Month Filter */}
                  <div className="relative">
                    <button
                      onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center space-x-2 text-sm"
                    >
                      <Calendar size={16} />
                      <span>Bulan: {selectedMonth}</span>
                      <ChevronDown size={16} />
                    </button>
                    {showMonthDropdown && (
                      <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg w-48">
                        {months.map((month) => (
                          <button
                            key={month}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            onClick={() => {
                              setSelectedMonth(month);
                              setShowMonthDropdown(false);
                            }}
                          >
                            {month}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Region Filter */}
                  <div className="relative">
                    <button
                      onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center space-x-2 text-sm"
                    >
                      <Filter size={16} />
                      <span>Wilayah: {selectedRegion}</span>
                      <ChevronDown size={16} />
                    </button>
                    {showRegionDropdown && (
                      <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg w-48">
                        {regions.map((region) => (
                          <button
                            key={region}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            onClick={() => {
                              setSelectedRegion(region);
                              setShowRegionDropdown(false);
                            }}
                          >
                            {region}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex-1"></div>

                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-64 text-sm"
                    />
                    <Search
                      size={16}
                      className="absolute left-3 top-2.5 text-gray-400"
                    />
                  </div>

                  {/* Export Button */}
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center space-x-2 text-sm hover:bg-green-700">
                    <Download size={16} />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6">
                {activeTab === "meter" ? (
                  <>
                    <h2 className="text-lg font-semibold mb-4">
                      Laporan Meteran - {selectedMonth} {selectedYear}
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white">
                        <thead>
                          <tr className="bg-gray-50 text-gray-500 text-sm">
                            <th className="px-6 py-3 text-left font-medium">
                              Pengguna
                            </th>
                            <th className="px-6 py-3 text-left font-medium">
                              NIK
                            </th>
                            <th className="px-6 py-3 text-left font-medium">
                              Wilayah
                            </th>
                            <th className="px-6 py-3 text-left font-medium">
                              Pembacaan Awal
                            </th>
                            <th className="px-6 py-3 text-left font-medium">
                              Pembacaan Akhir
                            </th>
                            <th className="px-6 py-3 text-left font-medium">
                              Penggunaan (m³)
                            </th>
                            <th className="px-6 py-3 text-left font-medium">
                              Tanggal Pencatatan
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {usersWithStats.map((userStats) => (
                            <tr key={userStats.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">{userStats.name}</td>
                              <td className="px-6 py-4">{userStats.nik}</td>
                              <td className="px-6 py-4">{userStats.region}</td>
                              <td className="px-6 py-4">{`${
                                userStats.meterBefore || userStats.meterNow
                              } m³`}</td>
                              <td className="px-6 py-4">
                                {userStats.meterNow} m³
                              </td>
                              <td className="px-6 py-4">
                                {`${getUsage(userStats)} m³` || "N/A"}
                              </td>
                              <td className="px-6 py-4">
                                {userStats.recordedAt
                                  ? new Date(
                                      userStats.recordedAt
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-blue-50">
                            <td
                              colSpan={5}
                              className="px-6 py-3 text-right font-medium"
                            >
                              Total Penggunaan:
                            </td>
                            <td className="px-6 py-3 font-bold">
                              {monthlyUsage.toFixed(1)} m³
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                      Menampilkan 3 dari 3 data
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-semibold mb-4">
                      Laporan Keuangan - {selectedMonth} {selectedYear}
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white">
                        <thead>
                          <tr className="bg-gray-50 text-gray-500 text-sm">
                            <th className="px-6 py-3 text-left font-medium">
                              Pengguna
                            </th>
                            <th className="px-6 py-3 text-left font-medium">
                              NIK
                            </th>
                            <th className="px-6 py-3 text-left font-medium">
                              Wilayah
                            </th>
                            <th className="px-6 py-3 text-left font-medium">
                              Penggunaan (m³)
                            </th>
                            <th className="px-6 py-3 text-left font-medium">
                              Tarif per m³
                            </th>
                            <th className="px-6 py-3 text-left font-medium">
                              Total Tagihan
                            </th>
                            <th className="px-6 py-3 text-left font-medium">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left font-medium">
                              Tanggal Bayar
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {usersWithStats.map((userStats) => (
                            <tr key={userStats.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">{userStats.name}</td>
                              <td className="px-6 py-4">{userStats.nik}</td>
                              <td className="px-6 py-4">{userStats.region}</td>
                              <td className="px-6 py-4">
                                {`${getUsage(userStats)} m³` || "N/A"}
                              </td>
                              <td className="px-6 py-4">
                                Rp {waterPricePerM3.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 font-medium">
                                Rp{" "}
                                {(
                                  getUsage(userStats) * waterPricePerM3 || 0
                                ).toLocaleString()}
                              </td>
                              <td className="px-6 py-4">
                                {/* <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                Lunas
                              </span> */}
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                  Tertunda
                                </span>
                              </td>
                              <td className="px-6 py-4">- </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-blue-50">
                            <td
                              colSpan={5}
                              className="px-6 py-3 text-right font-medium"
                            >
                              Total Pendapatan:
                            </td>
                            <td className="px-6 py-3 font-bold">Rp 0</td>
                            <td colSpan={2}></td>
                          </tr>
                          <tr className="bg-yellow-50">
                            <td
                              colSpan={5}
                              className="px-6 py-3 text-right font-medium"
                            >
                              Total Tertunda:
                            </td>
                            <td className="px-6 py-3 font-bold">
                              Rp{" "}
                              {(
                                monthlyUsage * waterPricePerM3 || 0
                              ).toLocaleString()}
                            </td>
                            <td colSpan={2}></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                      Menampilkan 3 dari 3 data
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
