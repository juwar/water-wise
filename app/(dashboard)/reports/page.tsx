import { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { meterReadings, users } from "@/db/schema";
import { getWaterPriceFromDb } from "@/lib/settings";
import { eq, and, sql } from "drizzle-orm";
import { Reports } from "@/components/reports/reports";

export const metadata: Metadata = {
  title: "Dashboard - Berair",
  description: "Manage your water meter readings",
};

// Helper function to calculate usage
const calculateUsage = (meterNow: number, meterBefore: number | null) => {
  if (meterBefore === null || meterBefore === 0) {
    return meterNow;
  }
  return meterNow - meterBefore;
};

// Helper function to ensure number type
const ensureNumber = (value: number | null): number => {
  return value ?? 0;
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const isAdmin = user.role === "admin" || user.role === "officer";
  if (!isAdmin) {
    redirect("/dashboard");
  }
  // Get water price from server-side function
  const waterPricePerM3 = await getWaterPriceFromDb();

  // Get total users count
  const totalUsers = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, "user"))
    .then((rows) => rows[0].count);

  // Get current month's readings
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyReadings = await db
    .select({
      meterNow: meterReadings.meterNow,
      meterBefore: meterReadings.meterBefore,
    })
    .from(meterReadings);
    // .where(
    //   and(
    //     sql`${meterReadings.recordedAt} >= ${startOfMonth.toISOString()}`,
    //     sql`${meterReadings.recordedAt} <= ${now.toISOString()}`
    //   )
    // );

  // Calculate monthly statistics with updated usage calculation
  const monthlyUsage = monthlyReadings.reduce((sum, reading) => {
    return (
      sum + calculateUsage(ensureNumber(reading.meterNow), reading.meterBefore)
    );
  }, 0);

  const averageUsagePerUser =
    monthlyReadings.length > 0 ? monthlyUsage / monthlyReadings.length : 0;

  // Get recent readings (last 7 days)
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentReadings = await db
    .select({ count: sql<number>`count(*)` })
    .from(meterReadings)
    .where(sql`${meterReadings.recordedAt} >= ${lastWeek.toISOString()}`)
    .then((rows) => rows[0].count);

  // Get all users with their latest readings and usage statistics
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

  // Calculate usage statistics for each user
  const usersWithStats = await Promise.all(
    allUsers.map(async (user) => {
      // Get monthly usage
      const userMonthlyReadings = await db
        .select({
          meterNow: meterReadings.meterNow,
          meterBefore: meterReadings.meterBefore,
        })
        .from(meterReadings)
        .where(
          and(
            eq(meterReadings.userId, user.id),
            sql`${meterReadings.recordedAt} >= ${startOfMonth.toISOString()}`,
            sql`${meterReadings.recordedAt} <= ${now.toISOString()}`
          )
        );

      // Get total usage
      const userTotalReadings = await db
        .select({
          meterNow: meterReadings.meterNow,
          meterBefore: meterReadings.meterBefore,
        })
        .from(meterReadings)
        .where(eq(meterReadings.userId, user.id));

      const monthlyUsage = userMonthlyReadings.reduce((sum, reading) => {
        return (
          sum +
          calculateUsage(ensureNumber(reading.meterNow), reading.meterBefore)
        );
      }, 0);

      const totalUsage = userTotalReadings.reduce((sum, reading) => {
        return (
          sum +
          calculateUsage(ensureNumber(reading.meterNow), reading.meterBefore)
        );
      }, 0);

      return {
        ...user,
        monthlyUsage,
        totalUsage,
        readingId: user.readingId,
        meterNow: user.meterNow,
        recordedAt: user.recordedAt,
        address: user.address,
      };
    })
  );

  return (
    <Reports
      userName={user.name ?? "User"}
      role={user.role}
      totalUsers={totalUsers}
      monthlyUsage={monthlyUsage}
      monthlyReadings={monthlyReadings.length}
      averageUsagePerUser={averageUsagePerUser}
      recentReadings={recentReadings}
      lastWeek={lastWeek}
      waterPricePerM3={waterPricePerM3}
      usersWithStats={usersWithStats}
    />
  );
}
