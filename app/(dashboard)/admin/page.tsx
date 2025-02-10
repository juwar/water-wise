import { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UsersList } from "@/components/users/users-list";

export const metadata: Metadata = {
  title: "Admin - Water Wise",
  description: "Manage users and system settings",
};

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage users and system settings
            </p>
          </div>
          <Link href="/admin/add">
            <Button>Add New User</Button>
          </Link>
        </div>

        <div className="rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Users</h2>
          </div>
          <UsersList />
        </div>
      </div>
    </div>
  );
}
