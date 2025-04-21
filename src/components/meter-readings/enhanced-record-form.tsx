"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { QRScanner } from "./qr-scanner";
import { useRouter } from "next/navigation";
import { DialogTitle } from "@radix-ui/react-dialog";

const searchSchema = z.object({
  search: z.string().min(1, "Mohon masukkan NIK atau nama"),
});

const recordSchema = z.object({
  userId: z.string(),
  meterNow: z.coerce.number().int().positive(),
  meterBefore: z.coerce.number().int().min(0),
});

type SearchFormValues = z.infer<typeof searchSchema>;
type RecordFormValues = z.infer<typeof recordSchema>;

interface User {
  id: number;
  name: string;
  nik: string;
  region: string;
  address: string;
  lastReading?: number;
  hasReadingThisMonth: boolean;
}

export function EnhancedRecordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const searchForm = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      search: "",
    },
  });

  const recordForm = useForm<RecordFormValues>({
    resolver: zodResolver(recordSchema),
  });

  async function onSearch(data: SearchFormValues) {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(data.search)}`
      );
      if (!response.ok) {
        throw new Error("Gagal mencari pengguna");
      }

      const users = await response.json();
      setSearchResults(users);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmitRecord(data: RecordFormValues) {
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
        throw new Error(error.message || "Gagal mencatat pembacaan");
      }

      searchForm.reset();
      recordForm.reset();
      setSelectedUser(null);
      setSearchResults([]);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  }

  function handleUserSelect(user: User) {
    setSelectedUser(user);
    recordForm.setValue("userId", user.id.toString());
    recordForm.setValue("meterBefore", user.lastReading || 0);
    setSearchResults([]);
    setShowQRScanner(false);
  }

  return (
    <div className="space-y-8">
      {!selectedUser && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowQRScanner(true)}
            >
              Pindai Kode QR
            </Button>
            <form
              onSubmit={searchForm.handleSubmit(onSearch)}
              className="flex-1 flex gap-2"
            >
              <Input
                {...searchForm.register("search")}
                placeholder="Cari berdasarkan NIK atau nama"
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                Cari
              </Button>
            </form>
          </div>

          {searchResults.length > 0 && (
            <div className="rounded-lg border divide-y">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className={`p-4 ${
                    user.hasReadingThisMonth
                      ? "bg-muted"
                      : "hover:bg-muted cursor-pointer"
                  }`}
                  onClick={() =>
                    !user.hasReadingThisMonth && handleUserSelect(user)
                  }
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        NIK: {user.nik} • Wilayah: {user.region}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.address}
                      </div>
                    </div>
                    {user.hasReadingThisMonth && (
                      <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">
                        Sudah dicatat bulan ini
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedUser && (
        <div className="space-y-6">
          <div className="rounded-lg border p-4 space-y-2">
            <div className="font-medium">{selectedUser.name}</div>
            <div className="text-sm text-muted-foreground">
              NIK: {selectedUser.nik} • Wilayah: {selectedUser.region}
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedUser.address}
            </div>
            <Button
              variant="ghost"
              className="text-sm"
              onClick={() => setSelectedUser(null)}
            >
              Ganti Pengguna
            </Button>
          </div>

          <form
            onSubmit={recordForm.handleSubmit(onSubmitRecord)}
            className="space-y-4"
          >
            <input type="hidden" {...recordForm.register("userId")} />
            <input type="hidden" {...recordForm.register("meterBefore")} />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Pembacaan Sebelumnya
                </span>
                <span className="text-sm font-medium">
                  {selectedUser.lastReading || 0}
                </span>
              </div>

              <div>
                <Input
                  {...recordForm.register("meterNow")}
                  type="number"
                  placeholder="Pembacaan meter saat ini"
                  min={selectedUser.lastReading || 0}
                  disabled={isLoading}
                />
                {recordForm.formState.errors.meterNow && (
                  <p className="mt-1 text-sm text-red-500">
                    {recordForm.formState.errors.meterNow.message}
                  </p>
                )}
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Mencatat..." : "Catat Pembacaan"}
            </Button>
          </form>
        </div>
      )}

      <Dialog open={showQRScanner}>
        <DialogContent>
          <DialogTitle>Kode QR</DialogTitle>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Pindai Kode QR</h2>
            <QRScanner
              onResult={(result) => {
                setShowQRScanner(false);
                searchForm.setValue("search", result);
                searchForm.handleSubmit(onSearch)();
              }}
              onError={(error) => setError(error)}
            />
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setShowQRScanner(false)}>
                Batal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
