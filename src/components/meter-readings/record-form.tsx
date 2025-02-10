"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const recordSchema = z.object({
  userId: z.string(),
  meterNow: z.coerce.number().int().positive(),
  meterBefore: z.coerce.number().int().min(0),
});

type RecordFormValues = z.infer<typeof recordSchema>;

interface RecordFormProps {
  userId: string;
  lastReading?: number;
  onSuccess?: () => void;
}

export function RecordForm({ userId, lastReading = 0, onSuccess }: RecordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RecordFormValues>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      userId,
      meterBefore: lastReading,
    },
  });

  async function onSubmit(data: RecordFormValues) {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/meter-readings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to record reading");
      }

      reset();
      onSuccess?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("userId")} />
      <input type="hidden" {...register("meterBefore")} />
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Previous Reading</span>
          <span className="text-sm font-medium">{lastReading}</span>
        </div>
        
        <div>
          <Input
            {...register("meterNow")}
            type="number"
            placeholder="Current meter reading"
            min={lastReading}
            disabled={isLoading}
          />
          {errors.meterNow && (
            <p className="mt-1 text-sm text-red-500">{errors.meterNow.message}</p>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Recording..." : "Record Reading"}
      </Button>
    </form>
  );
}
