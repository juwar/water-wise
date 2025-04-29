"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import {
  Droplet,
  Clock,
  Wallet,
  CreditCard,
  AlertCircle,
  Search,
  FileText,
} from "lucide-react";
import Link from "next/link";

const checkRecordSchema = z.object({
  nik: z.string().length(16, "NIK must be 16 characters"),
});

type CheckRecordFormValues = z.infer<typeof checkRecordSchema>;

interface MeterReading {
  meterNow: number;
  meterBefore: number;
  recordedAt: string;
}

export function CheckRecordForm({ waterPricePerM3 }: {
  waterPricePerM3: number;
}) {
  const [readings, setReadings] = useState<MeterReading[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckRecordFormValues>({
    resolver: zodResolver(checkRecordSchema),
  });

  async function onSubmit(data: CheckRecordFormValues) {
    try {
      setIsLoading(true);
      setError(null);
      setReadings(null);

      const response = await fetch(`/api/meter-readings/check?nik=${data.nik}`);
      if (!response.ok) {
        throw new Error("Failed to fetch meter readings");
      }

      const result = await response.json();
      if (result.readings.length === 0) {
        setError("No meter readings found for this NIK");
        return;
      }

      setReadings(result.readings);
    } catch {
      setError("Failed to fetch meter readings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const getUsage = (meter: MeterReading) =>
    meter.meterNow && meter.meterBefore
      ? meter.meterNow - meter.meterBefore
      : meter.meterNow || 0;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-1">
          Periksa Catatan Meteran Anda
        </h1>
        <p className="text-gray-500">
          Masukkan NIK Anda untuk melihat pembacaan meteran
        </p>
      </div>

      <div className="grid gap-4 mb-6">
        <div className="grid gap-2">
          <div className="relative">
            <Input
              {...register("nik")}
              placeholder="Masukkan Nik Anda"
              type="text"
              maxLength={16}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              disabled={isLoading}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute right-3 top-2.5 text-gray-400">
              <Search size={18} />
            </div>
          </div>
          {errors.nik && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.nik.message}
            </p>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle size={14} />
            {error}
          </p>
        )}
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isLoading ? "Memeriksa..." : "Periksa Catatan"}
        </button>
      </div>

      {readings && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText size={20} />
            Informasi Tagihan Air
          </h2>

          {readings.map((reading, index) => (
            <div key={index} className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="grid grid-cols-2 gap-y-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-500">Pembacaan Saat Ini</p>
                    <p className="font-medium text-lg">{reading.meterNow} m³</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Pembacaan Sebelumnya
                    </p>
                    <p className="font-medium text-lg">
                      {reading.meterBefore} m³
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-1 text-sm text-gray-500">
                  <Clock size={14} />
                  <span>Tanggal Pencatatan:</span>
                  <span className="font-medium">
                    {new Date(reading.recordedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <CreditCard size={20} />
                  Rincian Penggunaan
                </h3>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <Droplet size={18} className="text-blue-500" />
                        <span className="text-gray-700">Volume Penggunaan</span>
                      </div>
                      <span className="font-medium">
                        {`${getUsage(reading)} m³` || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <Wallet size={18} className="text-blue-500" />
                        <span className="text-gray-700">Tarif Per m³</span>
                      </div>
                      <span className="font-medium">
                        Rp {waterPricePerM3.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-2 font-medium">
                        <CreditCard size={18} className="text-blue-500" />
                        <span className="text-gray-900">Total Tagihan</span>
                      </div>
                      <span className="font-bold text-lg text-blue-600">
                        Rp{" "}
                        {(
                          getUsage(reading) * waterPricePerM3 || 0
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-6 text-center">
            <Link className="text-sm text-blue-600 hover:text-blue-800 font-medium" href="/login">
              Login Admin/Petugas
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
