"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  nik: z.string().length(16, "NIK must be 16 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormValues) {
    try {
      setIsLoading(true);
      setError(null);

      const result = await signIn("credentials", {
        nik: data.nik,
        password: data.password,
        redirect: false,
      });

      if (!result?.ok) {
        setError("Invalid NIK or password");
        return;
      }

      const from = searchParams.get("from") || "/dashboard";
      router.push(from);
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
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
          <div className="grid gap-2">
            <Input
              {...register("password")}
              placeholder="Password"
              type="password"
              autoComplete="current-password"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </div>
      </form>
    </div>
  );
}
