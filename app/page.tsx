import { CheckRecordForm } from "@/components/meter-readings/check-record-form";
import { Metadata } from "next";
import { getWaterPriceFromDb } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Check Meter Record - Berair",
  description: "Check your water meter readings",
};

export default async function HomePage() {
  const waterPricePerM3 = await getWaterPriceFromDb();
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <CheckRecordForm waterPricePerM3={waterPricePerM3} />
    </div>
  );
}
