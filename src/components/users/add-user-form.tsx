"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const userSchema = z.object({
  nik: z.string().length(16, "NIK harus terdiri dari 16 karakter"),
  name: z.string().min(2, "Nama harus memiliki minimal 2 karakter"),
  region: z.string().min(2, "Wilayah harus memiliki minimal 2 karakter"),
  address: z.string().min(5, "Alamat harus memiliki minimal 5 karakter"),
  role: z.enum(["admin", "officer", "user"]),
  password: z.string().min(6, "Kata sandi minimal 6 karakter").optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

export function AddUserForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: "user",
    },
  });

  const selectedRole = watch("role");

  async function onSubmit(data: UserFormValues) {
    try {
      setIsLoading(true);
      setError(null);

      const submissionData = {
        ...data,
        password: data.role === "user" ? data.nik : data.password,
      };

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Gagal membuat pengguna");
      }

      router.push("/users");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Gagal membuat pengguna");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            {...register("role")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            disabled={isLoading}
          >
            <option value="user">User</option>
            <option value="officer">Officer</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && (
            <p className="text-sm text-red-500">{errors.role.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <label htmlFor="nik">NIK</label>
          <Input
            id="nik"
            {...register("nik")}
            placeholder="Masukkan NIK"
            maxLength={16}
            disabled={isLoading}
          />
          {errors.nik && (
            <p className="text-sm text-red-500">{errors.nik.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <label htmlFor="name">Nama</label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Masukkan nama"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <label htmlFor="region">Wilayah</label>
          <Input
            id="region"
            {...register("region")}
            placeholder="Masukkan wilayah"
            disabled={isLoading}
          />
          {errors.region && (
            <p className="text-sm text-red-500">{errors.region.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <label htmlFor="address">Alamat</label>
          <Input
            id="address"
            {...register("address")}
            placeholder="Masukkan alamat"
            disabled={isLoading}
          />
          {errors.address && (
            <p className="text-sm text-red-500">{errors.address.message}</p>
          )}
        </div>

        {selectedRole !== "user" && (
          <div className="grid gap-2">
            <label htmlFor="password">Kata Sandi</label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Masukkan kata sandi"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Membuat..." : "Buat Pengguna"}
      </Button>
    </form>
  );
}
