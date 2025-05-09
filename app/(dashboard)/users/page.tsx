import { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UsersList } from "@/components/users/users-list";

export const metadata: Metadata = {
  title: "Pengguna - Berair",
  description: "Kelola pengguna sistem",
};

export default async function UsersPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h1>
            <p className="text-muted-foreground">
              Kelola pengguna sistem
            </p>
          </div>
          <Link href="/users/add">
            <Button>Tambah Pengguna Baru</Button>
          </Link>
        </div>

        <div className="rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Daftar Pengguna</h2>
          </div>
          <UsersList />
        </div>
      </div>
    </div>
  );
}
