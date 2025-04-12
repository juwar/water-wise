import { CheckRecordForm } from "@/components/meter-readings/check-record-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Check Meter Record - Berair",
  description: "Check your water meter readings",
};

export default function HomePage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Check Your Meter Record
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your NIK to view your meter readings
          </p>
        </div>
        <CheckRecordForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          <a href="/login" className="hover:text-brand underline underline-offset-4">
            Admin/Officer Login
          </a>
        </p>
      </div>
    </div>
  );
}
