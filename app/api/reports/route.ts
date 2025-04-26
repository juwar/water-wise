import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { users, meterReadings } from "@/db/schema";
import { eq, and, sql, like, inArray } from "drizzle-orm";

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
const ensureNumber = (value: number | null | undefined): number => {
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
    
    // First, get all available regions
    const regionsResult = await db
      .selectDistinct({ region: users.region })
      .from(users)
      .where(eq(users.role, "user"));
    
    const availableRegions = regionsResult.map(r => r.region);
    
    // For time filtering, we need to use raw SQL
    // First, get the IDs of the latest meter readings for each user within the time period
    let latestReadingsQuery;
    
    if (month && year) {
      // Filter by specific month and year
      latestReadingsQuery = sql`
        SELECT DISTINCT ON (user_id) id, user_id
        FROM meter_readings
        WHERE EXTRACT(MONTH FROM recorded_at) = ${month} AND EXTRACT(YEAR FROM recorded_at) = ${year}
        ORDER BY user_id, recorded_at DESC
      `;
    } else if (month) {
      // Filter by month only
      latestReadingsQuery = sql`
        SELECT DISTINCT ON (user_id) id, user_id
        FROM meter_readings
        WHERE EXTRACT(MONTH FROM recorded_at) = ${month}
        ORDER BY user_id, recorded_at DESC
      `;
    } else if (year) {
      // Filter by year only
      latestReadingsQuery = sql`
        SELECT DISTINCT ON (user_id) id, user_id
        FROM meter_readings
        WHERE EXTRACT(YEAR FROM recorded_at) = ${year}
        ORDER BY user_id, recorded_at DESC
      `;
    } else {
      // No time filters
      latestReadingsQuery = sql`
        SELECT DISTINCT ON (user_id) id, user_id
        FROM meter_readings
        ORDER BY user_id, recorded_at DESC
      `;
    }
    
    // Execute the query to get latest reading IDs
    const latestReadingsResult = await db.execute(latestReadingsQuery);
    console.log("🚀 ~ GET ~ latestReadingsResult:", latestReadingsResult)
    
    // Extract user IDs and reading IDs
    const readingIds: number[] = [];
    const userIds: number[] = [];
    
    // Handle the result structure correctly
    for (const row of latestReadingsResult) {
      if (row.id !== undefined && row.user_id !== undefined) {
        readingIds.push(Number(row.id));
        userIds.push(Number(row.user_id));
      }
    }
    
    // If we have time filters but no readings match, return empty data
    if ((month || year) && readingIds.length === 0) {
      return NextResponse.json({
        data: [],
        totalUsage: 0,
        totalUsagePaid: 0,
        availableRegions,
        filters: { month, year, region }
      });
    }
    
    // Build user filter conditions
    const userWhereConditions = [eq(users.role, "user")];
    
    // Add region filter if provided
    if (region && region !== "Semua Wilayah") {
      userWhereConditions.push(like(users.region, `%${region}%`));
    }
    
    // Add user ID filter if we have time filters
    if ((month || year) && userIds.length > 0) {
      userWhereConditions.push(inArray(users.id, userIds));
    }
    
    // Get users with the applied filters
    const filteredUsers = await db
      .select()
      .from(users)
      .where(and(...userWhereConditions));

    
    // Get the meter readings for these users (only the ones that match our criteria)
    const filteredReadings = readingIds.length > 0 ? 
      await db
        .select()
        .from(meterReadings)
        .where(inArray(meterReadings.id, readingIds)) : 
      [];
    
    // Combine users with their readings
    const allUsers = filteredUsers.map(user => {
      const reading = filteredReadings.find(r => r.userId === user.id);
      
      return {
        id: user.id,
        name: user.name,
        nik: user.nik,
        region: user.region,
        createdAt: user.createdAt,
        address: user.address,
        readingId: reading?.id ?? null,
        meterNow: ensureNumber(reading?.meterNow),
        meterBefore: ensureNumber(reading?.meterBefore),
        meterPaid: ensureNumber(reading?.meterPaid),
        lastPayment: reading?.lastPayment ?? null,
        recordedAt: reading?.recordedAt ?? null,
      };
    });

    // Calculate totals
    const totalUsage = allUsers.reduce((sum, reading) => {
      return sum + calculateUsage(reading.meterNow, reading.meterBefore);
    }, 0);

    const totalUsagePaid = allUsers.reduce((sum, reading) => {
      return sum + (reading.meterPaid >= reading.meterNow && reading.lastPayment !== null ?
        calculateUsage(reading.meterNow, reading.meterBefore) : 0);
    }, 0);

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