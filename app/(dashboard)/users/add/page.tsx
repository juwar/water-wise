import { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { AddUserForm } from "@/components/users/add-user-form";

export const metadata: Metadata = {
  title: "Add User - Berair",
  description: "Add a new user to the system",
};

export default async function AddUserPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Add New User</h1>
          <p className="text-muted-foreground">
            Create a new user account in the system
          </p>
        </div>
        <AddUserForm />
      </div>
    </div>
  );
}
