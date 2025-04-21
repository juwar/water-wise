import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { meterReadings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const readingId = parseInt(params.id);
    if (isNaN(readingId)) {
      return NextResponse.json(
        { message: "Invalid reading ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { meterNow } = body;

    if (typeof meterNow !== "number" || meterNow < 0) {
      return NextResponse.json(
        { message: "Invalid meter reading" },
        { status: 400 }
      );
    }

    // Update the reading
    await db
      .update(meterReadings)
      .set({ meterNow })
      .where(eq(meterReadings.id, readingId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[METER_READING_UPDATE]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
