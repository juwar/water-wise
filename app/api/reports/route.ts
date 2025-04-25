import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { users, meterReadings } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// Helper function to calculate usage
const calculateUsage = (meterNow: number, meterBefore: number | null) => {
  if (meterNow === null || meterNow === 0) {
    return 0;
  }
  if (meterBefore === null || meterBefore === 0) {
    return meterNow;
  }
  return meterNow - meterBefore;
};

// Helper function to ensure number type
const ensureNumber = (value: number | null): number => {
  return value ?? 0;
};

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        nik: users.nik,
        region: users.region,
        createdAt: users.createdAt,
        address: users.address,
        readingId: meterReadings.id,
        meterNow: meterReadings.meterNow,
        meterBefore: meterReadings.meterBefore,
        recordedAt: meterReadings.recordedAt,
        meterPaid: meterReadings.meterPaid,
        lastPayment: meterReadings.lastPayment
      })
      .from(users)
      .leftJoin(
        meterReadings,
        and(
          eq(users.id, meterReadings.userId),
          sql`${meterReadings.id} IN (
                SELECT id FROM meter_readings mr2 
                WHERE mr2.user_id = ${users.id} 
                ORDER BY mr2.recorded_at DESC 
                LIMIT 1
              )`
        )
      )
      .where(eq(users.role, "user"));

    const totalUsage = allUsers.reduce((sum, reading) => {
      return (
        sum +
        calculateUsage(ensureNumber(reading.meterNow), reading.meterBefore)
      );
    }, 0);
    const totalUsagePaid = allUsers.reduce((sum, reading) => {
      return (
        sum + (ensureNumber(reading.meterPaid) >= ensureNumber(reading?.meterNow) && reading.lastPayment !== null ?
        calculateUsage(ensureNumber(reading.meterNow), reading.meterBefore) : 0)
      );
    }, 0);

    return NextResponse.json({ data: allUsers, totalUsage, totalUsagePaid });
  } catch (error) {
    console.error("[USERS_GET]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
