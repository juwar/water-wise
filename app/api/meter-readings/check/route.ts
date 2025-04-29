import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { meterReadings, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const nik = searchParams.get("nik");

    if (!nik) {
      return NextResponse.json(
        { message: "NIK is required" },
        { status: 400 }
      );
    }

    // First find the user by NIK
    const userResult = await db
      .select({
        id: users.id,
      })
      .from(users)
      .where(eq(users.nik, nik))
      .limit(1);

    if (!userResult || userResult.length === 0) {
      return NextResponse.json(
        { message: "User not found", readings: [] },
        { status: 404 }
      );
    }

    // Then get their meter readings
    const readings = await db
      .select({
        meterNow: meterReadings.meterNow,
        meterBefore: meterReadings.meterBefore,
        meterPaid: meterReadings.meterPaid,
        lastPayment: meterReadings?.lastPayment ?? null,
        recordedAt: meterReadings?.recordedAt ?? null,
      })
      .from(meterReadings)
      .where(eq(meterReadings.userId, userResult[0].id))
      .orderBy(desc(meterReadings.recordedAt));

    return NextResponse.json({ readings });
  } catch (error) {
    console.error("[METER_READINGS_CHECK]", error);
    return NextResponse.json(
      { message: "Internal server error", readings: [] },
      { status: 500 }
    );
  }
}
