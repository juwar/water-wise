import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { users, meterReadings } from "@/db/schema";
import { or, ilike, eq, and, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || (user.role !== "admin" && user.role !== "officer")) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { message: "Search query is required" },
        { status: 400 }
      );
    }

    // Get users with their latest meter reading
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const searchResults = await db
      .select({
        id: users.id,
        name: users.name,
        nik: users.nik,
        region: users.region,
        address: users.address,
        lastReading: meterReadings.meterNow,
        hasReadingThisMonth: sql<boolean>`EXISTS (
          SELECT 1 FROM meter_readings mr2 
          WHERE mr2.user_id = ${users.id}
          AND mr2.recorded_at >= ${startOfMonth.toISOString()}
          AND mr2.recorded_at <= ${endOfMonth.toISOString()}
        )`,
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
      .where(
        or(
          ilike(users.name, `%${query}%`),
          ilike(users.nik, `%${query}%`)
        )
      )
      .limit(10);

    return NextResponse.json(searchResults);
  } catch (error) {
    console.error("[USERS_SEARCH]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
