import { NextResponse, NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { websiteSettings } from "@/db/schema";
import { eq, } from "drizzle-orm";
import { z } from "zod";

const updateSchema = z.object({
  value: z.string(),
});

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin" ) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await req.json();
    const validatedData = updateSchema.parse(body);

    // Update the reading
    await db
      .update(websiteSettings)
      .set({
        value: validatedData.value,
        updatedAt: new Date(),
      })
      .where(eq(websiteSettings.key, "water_price_per_m3"))

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request data", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("[Water Price]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}