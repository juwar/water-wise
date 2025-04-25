import { NextResponse, NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { meterReadings } from "@/db/schema";
import { eq, } from "drizzle-orm";
import { z } from "zod";

const updateSchema = z.object({
  id: z.number(),
});

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin" ) {
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
        meterPaid: existingReading[0]?.meterNow,
        lastPayment: new Date(),
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

    console.error("[PAYMENT]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}