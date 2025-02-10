"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const checkRecordSchema = z.object({
  nik: z.string().length(16, "NIK must be 16 characters"),
});

type CheckRecordFormValues = z.infer<typeof checkRecordSchema>;

interface MeterReading {
  meterNow: number;
  meterBefore: number;
  recordedAt: string;
}

export function CheckRecordForm() {
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
    } catch (error) {
      setError("Failed to fetch meter readings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Input
              {...register("nik")}
              placeholder="Enter your NIK"
              type="text"
              maxLength={16}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              disabled={isLoading}
            />
            {errors.nik && (
              <p className="text-sm text-red-500">{errors.nik.message}</p>
            )}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Checking..." : "Check Records"}
          </Button>
        </div>
      </form>

      {readings && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Your Meter Readings</h2>
          <div className="space-y-4">
            {readings.map((reading, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg bg-muted"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Reading</p>
                    <p className="font-medium">{reading.meterNow}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Previous Reading</p>
                    <p className="font-medium">{reading.meterBefore}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Recorded At</p>
                    <p className="font-medium">
                      {new Date(reading.recordedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
