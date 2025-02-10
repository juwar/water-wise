import { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { meterReadings, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Officer - Water Wise",
  description: "Record and manage water meter readings",
};

import { UserSelector } from "@/components/meter-readings/user-selector";
import { EditableReading } from "@/components/meter-readings/editable-reading";

export default async function OfficerPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "admin" && user.role !== "officer")) {
    redirect("/dashboard");
  }

  // Get users with their latest meter readings
  const recentReadings = await db
  .select({
    userId: users.id,
    userName: users.name,
    userNik: users.nik,
    userRegion: users.region,
    readingId: meterReadings.id,
    meterNow: meterReadings.meterNow,
    meterBefore: meterReadings.meterBefore,
    recordedAt: meterReadings.recordedAt,
  })
  .from(users)
  .leftJoin(meterReadings, eq(users.id, meterReadings.userId))
  .where(eq(users.role, "user"))
  .orderBy(desc(meterReadings.recordedAt))
  .limit(10);

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Officer Dashboard</h1>
          <p className="text-muted-foreground">
            Record and manage water meter readings
          </p>
        </div>

        {/* Record New Reading */}
        <div className="rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Record New Reading</h2>
          </div>
          <div className="p-4">
            <UserSelector />
          </div>
        </div>

        {/* Recent Readings Table */}
        <div className="rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Recent Readings</h2>
          </div>
          <div className="relative overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium">NIK</th>
                  <th className="p-4 font-medium">Region</th>
                  <th className="p-4 font-medium">Previous</th>
                  <th className="p-4 font-medium">Current</th>
                  <th className="p-4 font-medium">Usage</th>
                  <th className="p-4 font-medium">Recorded At</th>
                </tr>
              </thead>
              <tbody>
                {recentReadings.map((reading) => (
                  <tr key={reading.userId} className="border-t">
                    <td className="p-4">{reading.userName}</td>
                    <td className="p-4">{reading.userNik}</td>
                    <td className="p-4">{reading.userRegion}</td>
                    <td className="p-4">{reading.meterBefore || 'No reading'}</td>
                    <td className="p-4">
                      {reading.readingId ? (
                        <EditableReading
                          readingId={reading.readingId}
                          currentValue={reading.meterNow}
                          previousValue={reading.meterBefore}
                        />
                      ) : (
                        'No reading'
                      )}
                    </td>
                    <td className="p-4">
                      {reading.meterNow && reading.meterBefore 
                        ? reading.meterNow - reading.meterBefore 
                        : 'N/A'}
                    </td>
                    <td className="p-4">
                      {reading.recordedAt 
                        ? reading.recordedAt.toLocaleDateString()
                        : 'Never'}
                    </td>
                  </tr>
                ))}
                {recentReadings.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-muted-foreground">
                      No readings recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
