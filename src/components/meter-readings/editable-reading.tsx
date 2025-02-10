"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EditableReadingProps {
  readingId: number | null;
  currentValue: number | null;
  previousValue: number | null;
}

export function EditableReading({
  readingId,
  currentValue,
  previousValue,
}: EditableReadingProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(currentValue || 0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSave() {
    if (previousValue !== null && value <= previousValue) {
      setError("New reading must be greater than previous reading");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/meter-readings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: readingId,
          meterNow: value,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update reading");
      }

      setIsEditing(false);
      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update reading");
    } finally {
      setIsLoading(false);
    }
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            min={previousValue ? previousValue + 1 : 0}
            disabled={isLoading}
            className="w-24"
          />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isLoading || (previousValue !== null && value <= previousValue)}
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsEditing(false);
              setValue(currentValue || 0);
              setError(null);
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span>{currentValue}</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
      >
        Edit
      </Button>
    </div>
  );
}
