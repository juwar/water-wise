import * as dotenv from "dotenv";
dotenv.config({ path: '.env.local' });

import { db } from "@/lib/db";
import { users, credentials, meterReadings } from "./schema";
import bcrypt from "bcrypt";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

async function seed() {
  try {
    // Clear existing data in correct order
    await db.delete(meterReadings);
    await db.delete(credentials);
    await db.delete(users);
    
    // Create admin user
    const adminUser = await db.insert(users).values({
      nik: "1234567890123456",
      name: "Admin User",
      region: "Central",
      address: "123 Admin Street",
      role: "admin",
    }).returning();

    await db.insert(credentials).values({
      userId: adminUser[0].id,
      nik: "1234567890123456",
      password: await bcrypt.hash("admin123", 10),
    });

    // Create officer user
    const officerUser = await db.insert(users).values({
      nik: "2345678901234567",
      name: "Officer User",
      region: "North",
      address: "456 Officer Avenue",
      role: "officer",
    }).returning();

    await db.insert(credentials).values({
      userId: officerUser[0].id,
      nik: "2345678901234567",
      password: await bcrypt.hash("officer123", 10),
    });

    console.log("✅ Seed data inserted successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

seed();
