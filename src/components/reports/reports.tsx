"use client";

import { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { MeterReadings, Users } from "@/db/schema";
import {
  Calendar,
  FileText,
  Filter,
  Download,
  ChevronDown,
  // Search,
  CreditCard,
  Loader,
} from "lucide-react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import WaterInvoice from "./invoice";
interface AdminDashboardProps {
  waterPricePerM3: number;
}

type ReportType = MeterReadings &
  Users & {
    readingId: number;
  };

type InvoiceData = {
  name: string;
  nik: string;
  region: string;
  usage: number;
  rate: number;
  total: number;
  status: string;
  paymentDate: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const mutator = (url: string, { arg }: { arg: unknown }) =>
  fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to mutate");
    return res.json();
  });

// Helper to get current year
const getCurrentYear = () => new Date().getFullYear();

// Generate years array starting from current year back to 2023
const generateYears = () => {
  const currentYear = getCurrentYear();
  const years = [];
  for (let year = currentYear; year >= 2023; year--) {
    years.push(year);
  }
  return years;
};

// Get month number from name (Indonesian)
const getMonthNumber = (monthName: string) => {
  const monthMap: Record<string, number> = {
    Januari: 1,
    Februari: 2,
    Maret: 3,
    April: 4,
    Mei: 5,
    Juni: 6,
    Juli: 7,
    Agustus: 8,
    September: 9,
    Oktober: 10,
    November: 11,
    Desember: 12,
  };
  return monthMap[monthName] || null;
};

export function Reports({ waterPricePerM3 }: AdminDashboardProps) {
  const getUsage = (meter: ReportType) =>
    meter.meterNow && meter.meterBefore
      ? meter.meterNow - meter.meterBefore
      : meter.meterNow || 0;
  const [activeTab, setActiveTab] = useState("meter");
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(0);
  const [invoiceData, setSetInvoiceData] = useState<InvoiceData>({
    name: "",
    nik: "",
    region: "",
    usage: 0,
    rate: 0,
    total: 0,
    status: "",
    paymentDate: "",
  });

  // Years are now dynamically generated
  const years = generateYears();

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

  // Initialize with current date values
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(
    months[currentDate.getMonth()]
  );
  const [selectedRegion, setSelectedRegion] = useState("Semua Wilayah");

  // Store available regions from API response
  const [availableRegions, setAvailableRegions] = useState<string[]>([
    "Semua Wilayah",
  ]);

  // Build the API URL with query parameters
  const buildApiUrl = () => {
    const params = new URLSearchParams();

    // Add year filter if not current year (optional: remove this condition to always include year)
    if (selectedYear) {
      params.append("year", selectedYear.toString());
    }

    // Add month filter if selected
    const monthNumber = getMonthNumber(selectedMonth);
    if (monthNumber) {
      params.append("month", monthNumber.toString());
    }

    // Add region filter if not "Semua Wilayah"
    if (selectedRegion && selectedRegion !== "Semua Wilayah") {
      params.append("region", selectedRegion);
    }

    return `/api/reports?${params.toString()}`;
  };

  // Fetch data with SWR using the built URL
  const {
    data: reportResponse,
    isLoading,
    mutate,
  } = useSWR<{
    data: ReportType[];
    totalUsage: number;
    totalUsagePaid: number;
    availableRegions?: string[];
    filters: {
      month: number | null;
      year: number | null;
      region: string | null;
    };
  }>(buildApiUrl, fetcher);

  // Extract reports data and other information
  const reports = reportResponse?.data || [];
  const totalUsage = reportResponse?.totalUsage || 0;
  const totalUsagePaid = reportResponse?.totalUsagePaid || 0;

  // Update available regions when API response includes them
  useEffect(() => {
    if (reportResponse?.availableRegions) {
      // Always include "Semua Wilayah" as the first option
      setAvailableRegions([
        "Semua Wilayah",
        ...reportResponse.availableRegions,
      ]);
    }
  }, [reportResponse?.availableRegions]);

  // Handle filter changes
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setSelectedRegion("Semua Wilayah");
    setShowYearDropdown(false);
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    setSelectedRegion("Semua Wilayah");
    setShowMonthDropdown(false);
  };

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setShowRegionDropdown(false);
  };
  const { trigger, data } = useSWRMutation("/api/reports/payment", mutator);

  const handlePayment = async (id: number) => {
    try {
      await trigger({
        id,
      });
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message);
    }
  };

  const handleShowInvoice = (id: number) => {
    setSelectedInvoice(id);
    const data = reports?.filter((x) => x?.readingId === id)[0];
    setSetInvoiceData({
      name: data.name,
      nik: data.nik,
      region: data.region,
      usage: getUsage(data),
      rate: waterPricePerM3,
      total: getUsage(data) * waterPricePerM3 || 0,
      status: data.meterNow > data.meterPaid ? "Tertunda" : "Lunas",
      paymentDate: data?.lastPayment
        ? new Date(data.lastPayment as Date).toLocaleDateString()
        : "- ",
    });
  };

  useEffect(() => {
    mutate();
  }, [data?.success]);

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  return (
    <div className="container py-8" ref={contentRef}>
      <style type="text/css" media="print">
        {`
          @media print {
            /* Fit content to page width */
            table {
              width: 100% !important;
              table-layout: fixed !important;
            }
            
            /* Adjust font size for better fit */
            td, th {
              font-size: 10pt !important;
              padding: 4px !important;
            }
            
            /* Hide any unnecessary elements when printing */
            .wrap-text {
              word-wrap: break-word;
              overflow-wrap: break-word;
              white-space: normal;
            }

            .no-print {
              display: none !important;
            }
            
            /* Ensure page breaks don't split rows */
            tr {
              page-break-inside: avoid !important;
            }
            
            /* Adjust page margins */
            @page {
              margin: 0.5cm;
            }
          }
        `}
      </style>
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
                              handleYearChange(year);
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
                              handleMonthChange(month);
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
                        {availableRegions.map((region) => (
                          <button
                            key={region}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            onClick={() => {
                              handleRegionChange(region);
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

                  {/* Export Button */}
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center space-x-2 text-sm hover:bg-green-700"
                    onClick={() => reactToPrintFn()}
                  >
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
                            <th className="wrap-text px-6 py-3 text-left font-medium">
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
                          {isLoading ? (
                            <tr>
                              <td colSpan={7} className="px-6 py-10">
                                <div className="flex flex-col items-center justify-center">
                                  <Loader className="h-8 w-8 text-blue-500 animate-spin" />
                                  <p className="mt-2 text-gray-500">
                                    Memuat data...
                                  </p>
                                </div>
                              </td>
                            </tr>
                          ) : reports?.length === 0 ? (
                            <tr>
                              <td
                                colSpan={7}
                                className="px-6 py-10 text-center text-gray-500"
                              >
                                Tidak ada data untuk ditampilkan
                              </td>
                            </tr>
                          ) : (
                            reports?.map((report) => (
                              <tr key={report.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">{report.name}</td>
                                <td className="wrap-text px-6 py-4">{report.nik}</td>
                                <td className="px-6 py-4">{report.region}</td>
                                <td className="px-6 py-4">{`${
                                  report.meterBefore || report.meterNow
                                } m³`}</td>
                                <td className="px-6 py-4">
                                  {report.meterNow} m³
                                </td>
                                <td className="px-6 py-4">
                                  {`${getUsage(report)} m³` || "N/A"}
                                </td>
                                <td className="px-6 py-4">
                                  {report.recordedAt
                                    ? new Date(
                                        report.recordedAt
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </td>
                              </tr>
                            ))
                          )}
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
                              {totalUsage.toFixed(1)} m³
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    {/* <div className="mt-4 text-sm text-gray-500">
                      Menampilkan 3 dari 3 data
                    </div> */}
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
                            <th className="wrap-text px-6 py-3 text-left font-medium">
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
                            <th className="px-6 py-3 text-left font-medium">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {isLoading ? (
                            <tr>
                              <td colSpan={7} className="px-6 py-10">
                                <div className="flex flex-col items-center justify-center">
                                  <Loader className="h-8 w-8 text-blue-500 animate-spin" />
                                  <p className="mt-2 text-gray-500">
                                    Memuat data...
                                  </p>
                                </div>
                              </td>
                            </tr>
                          ) : reports?.length === 0 ? (
                            <tr>
                              <td
                                colSpan={7}
                                className="px-6 py-10 text-center text-gray-500"
                              >
                                Tidak ada data untuk ditampilkan
                              </td>
                            </tr>
                          ) : (
                            reports?.map((report) => (
                              <tr key={report.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">{report.name}</td>
                                <td className="wrap-text px-6 py-4">{report.nik}</td>
                                <td className="px-6 py-4">{report.region}</td>
                                <td className="px-6 py-4">
                                  {`${getUsage(report)} m³` || "N/A"}
                                </td>
                                <td className="px-6 py-4">
                                  Rp {waterPricePerM3.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 font-medium">
                                  Rp{" "}
                                  {(
                                    getUsage(report) * waterPricePerM3 || 0
                                  ).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                  {report.meterNow > report.meterPaid ? (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                      Tertunda
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                      Lunas
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  {report.meterPaid >= report.meterNow &&
                                  report?.lastPayment
                                    ? new Date(
                                        report.lastPayment as Date
                                      ).toLocaleDateString()
                                    : "-"}
                                </td>
                                <td className="px-6 py-4">
                                  {report.meterNow > report.meterPaid ? (
                                    <button
                                      onClick={() =>
                                        handlePayment(report?.readingId)
                                      }
                                      className="px-3 py-1 bg-blue-600 text-white rounded flex items-center space-x-1 text-xs hover:bg-blue-700"
                                    >
                                      <CreditCard size={12} />
                                      <span>Bayar</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        handleShowInvoice(report?.readingId)
                                      }
                                      className="px-3 py-1 bg-green-600 text-white rounded flex items-center space-x-1 text-xs hover:bg-green-700"
                                    >
                                      <CreditCard size={12} />
                                      <span>Cetak</span>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        <tfoot>
                          <tr className="bg-blue-50">
                            <td
                              colSpan={6}
                              className="px-6 py-3 text-right font-medium"
                            >
                              Total Pendapatan:
                            </td>
                            <td className="px-6 py-3 font-bold">
                              Rp{" "}
                              {(
                                (totalUsagePaid || 0) * waterPricePerM3 || 0
                              ).toLocaleString()}
                            </td>
                            <td colSpan={2}></td>
                          </tr>
                          <tr className="bg-yellow-50">
                            <td
                              colSpan={6}
                              className="px-6 py-3 text-right font-medium"
                            >
                              Total Tertunda:
                            </td>
                            <td className="px-6 py-3 font-bold">
                              Rp{" "}
                              {(
                                ((totalUsage || 0) - (totalUsagePaid || 0) ||
                                  0) * waterPricePerM3 || 0
                              ).toLocaleString()}
                            </td>
                            <td colSpan={2}></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      {selectedInvoice && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedInvoice(0)}
        >
          <WaterInvoice invoiceData={invoiceData} />
        </div>
      )}
    </div>
  );
}
