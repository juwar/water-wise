"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Save } from "lucide-react";

interface EditableMeterProps {
  readingId: number;
  currentValue: number | null;
  previousValue: number | null;
  isAdmin: boolean;
  onUpdate?: () => void;
}

export function EditableMeter({
  readingId,
  currentValue,
  previousValue,
  isAdmin,
  onUpdate,
}: EditableMeterProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(currentValue?.toString() || "");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSave() {
    if (!value || isNaN(Number(value))) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/meter-readings/${readingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meterNow: Number(value) }),
      });

      if (!response.ok) {
        throw new Error("Failed to update reading");
      }

      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error("Failed to update reading:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isAdmin) {
    return <span>{currentValue || "No reading"}</span>;
  }

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <span>{`${currentValue} m³` || "No reading"}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            setValue(currentValue?.toString() || "");
            setIsEditing(true);
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-24 pr-8"
          min={previousValue || 0}
          disabled={isLoading}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
          m³
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleSave}
        disabled={isLoading}
      >
        <Save className="h-4 w-4" />
      </Button>
      <Button
        variant="link"
        size="icon"
        className="h-8 w-8 ml-1"
        onClick={() => setIsEditing(false)}
        disabled={isLoading}
      >
        Cancel
      </Button>
    </div>
  );
}
