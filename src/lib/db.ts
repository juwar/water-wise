import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const connectionString = process.env.DATABASE_URL;

// For migrations
export const migrationClient = postgres(connectionString, { 
  max: 1,
  ssl: false, // Disable SSL for local development
});

// For queries
const queryClient = postgres(connectionString, {
  ssl: false, // Disable SSL for local development
});

export const db = drizzle(queryClient, { schema });
