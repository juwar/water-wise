import { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { EnhancedRecordForm } from "@/components/meter-readings/enhanced-record-form";

export const metadata: Metadata = {
  title: "Record Meter Reading - Water Wise",
  description: "Record new water meter reading with QR scanning",
};

export default async function RecordPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "admin" && user.role !== "officer")) {
    redirect("/dashboard");
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Record Meter Reading</h1>
          <p className="text-muted-foreground">
            Record new water meter reading using QR code or manual input
          </p>
        </div>

        <div className="rounded-lg border">
          <div className="p-4">
            <EnhancedRecordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
