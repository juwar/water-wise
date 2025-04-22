import { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { getWaterPriceFromDb } from "@/lib/settings";
import { Reports } from "@/components/reports/reports";

export const metadata: Metadata = {
  title: "Dashboard - Berair",
  description: "Manage your water meter readings",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const isAdmin = user.role === "admin" || user.role === "officer";
  if (!isAdmin) {
    redirect("/dashboard");
  }
  // Get water price from server-side function
  const waterPricePerM3 = await getWaterPriceFromDb();

  return (
    <Reports
      waterPricePerM3={waterPricePerM3}
    />
  );
}
