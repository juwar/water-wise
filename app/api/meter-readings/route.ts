import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { meterReadings } from "@/db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { z } from "zod";

const recordSchema = z.object({
  userId: z.string(),
  meterNow: z.number().int().positive(),
  meterBefore: z.number().int().min(0),
});

const updateSchema = z.object({
  id: z.number(),
  meterNow: z.number().int().positive(),
});

// Helper function to check if a reading exists for this month
async function hasReadingThisMonth(userId: number) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const existingReading = await db
    .select({ id: meterReadings.id })
    .from(meterReadings)
    .where(
      and(
        eq(meterReadings.userId, userId),
        gte(meterReadings.recordedAt, startOfMonth),
        lte(meterReadings.recordedAt, endOfMonth)
      )
    )
    .limit(1);

  return existingReading.length > 0;
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || (user.role !== "admin" && user.role !== "officer")) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await req.json();
    const validatedData = updateSchema.parse(body);

    // Get the existing reading
    const existingReading = await db
      .select()
      .from(meterReadings)
      .where(eq(meterReadings.id, validatedData.id))
      .limit(1);

    if (!existingReading || existingReading.length === 0) {
      return NextResponse.json(
        { message: "Reading not found" },
        { status: 404 }
      );
    }

    // Update the reading
    await db
      .update(meterReadings)
      .set({
        meterNow: validatedData.meterNow,
        updatedAt: new Date(),
      })
      .where(eq(meterReadings.id, validatedData.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request data", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("[METER_READINGS_PUT]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || (user.role !== "admin" && user.role !== "officer")) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await req.json();
    const validatedData = recordSchema.parse(body);

    if (validatedData.meterNow <= validatedData.meterBefore) {
      return NextResponse.json(
        { message: "Current reading must be greater than previous reading" },
        { status: 400 }
      );
    }

    // Check if a reading already exists for this month
    const hasReading = await hasReadingThisMonth(parseInt(validatedData.userId));
    if (hasReading) {
      return NextResponse.json(
        { message: "A reading has already been recorded for this user this month" },
        { status: 400 }
      );
    }

    const reading = await db.insert(meterReadings).values({
      userId: parseInt(validatedData.userId),
      meterNow: validatedData.meterNow,
      meterBefore: validatedData.meterBefore,
      recordedAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, data: reading });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request data", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("[METER_READINGS_POST]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const readings = await db
      .select()
      .from(meterReadings)
      .where(eq(meterReadings.userId, parseInt(userId)))
      .orderBy(desc(meterReadings.recordedAt));

    return NextResponse.json({ data: readings });
  } catch (error) {
    console.error("[METER_READINGS_GET]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
