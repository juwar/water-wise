import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { users, meterReadings } from "@/db/schema";
import { eq, and, sql, like } from "drizzle-orm";

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

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Get URL params
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : null;
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : null;
    const region = searchParams.get("region");

    // Build where conditions
    const whereConditions = [eq(users.role, "user")];
    
    // Add region filter if provided
    if (region) {
      whereConditions.push(like(users.region, `%${region}%`));
    }

    // Build base query with all conditions
    const query = db
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
      .where(and(...whereConditions));

    // Modify the join based on time filters
    let timeFilterCondition = sql`1=1`; // Default condition that's always true

    if (month && year) {
      // Filter by specific month and year
      timeFilterCondition = sql`EXTRACT(MONTH FROM ${meterReadings.recordedAt}) = ${month} AND EXTRACT(YEAR FROM ${meterReadings.recordedAt}) = ${year}`;
    } else if (month) {
      // Filter by month only (any year)
      timeFilterCondition = sql`EXTRACT(MONTH FROM ${meterReadings.recordedAt}) = ${month}`;
    } else if (year) {
      // Filter by year only (any month)
      timeFilterCondition = sql`EXTRACT(YEAR FROM ${meterReadings.recordedAt}) = ${year}`;
    }

    // Execute the query with a complex join that respects the time filtering
    const results = await query
      .leftJoin(
        meterReadings,
        and(
          eq(users.id, meterReadings.userId),
          sql`${meterReadings.id} IN (
            SELECT id FROM meter_readings mr2
            WHERE mr2.user_id = ${users.id}
            AND ${timeFilterCondition}
            ORDER BY mr2.recorded_at DESC
            LIMIT 1
          )`
        )
      );

    // Process the results
    const allUsers = results.map(record => ({
      ...record,
      meterNow: ensureNumber(record.meterNow),
      meterBefore: ensureNumber(record.meterBefore),
      meterPaid: ensureNumber(record.meterPaid),
    }));

    // Calculate totals
    const totalUsage = allUsers.reduce((sum, reading) => {
      return sum + calculateUsage(reading.meterNow, reading.meterBefore);
    }, 0);

    const totalUsagePaid = allUsers.reduce((sum, reading) => {
      return sum + (reading.meterPaid >= reading.meterNow && reading.lastPayment !== null ?
        calculateUsage(reading.meterNow, reading.meterBefore) : 0);
    }, 0);

    // Get all unique regions from the database
    const regionsResult = await db
      .selectDistinct({ region: users.region })
      .from(users)
      .where(eq(users.role, "user"));

    const availableRegions = regionsResult.map(r => r.region);

    // Return the filtered data with totals
    return NextResponse.json({
      data: allUsers,
      totalUsage,
      totalUsagePaid,
      availableRegions,
      filters: {
        month,
        year,
        region
      }
    });
  } catch (error) {
    console.error("[USERS_GET]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}