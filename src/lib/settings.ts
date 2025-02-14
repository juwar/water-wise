import { db } from "./db";
import { websiteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface WebsiteSetting {
  key: string;
  value: string;
  desc: string;
}

// Server-side function to get setting from database
export async function getSettingFromDb(key: string): Promise<WebsiteSetting | null> {
  const setting = await db
    .select()
    .from(websiteSettings)
    .where(eq(websiteSettings.key, key))
    .limit(1)
    .then(rows => rows[0] || null);

  return setting;
}

// Server-side function to get water price
export async function getWaterPriceFromDb(): Promise<number> {
  try {
    const setting = await getSettingFromDb('water_price_per_m3');
    const price = setting ? parseInt(setting.value) : 5000; // Default to 5000 if not set
    return isNaN(price) ? 5000 : price; // Ensure we return a valid number
  } catch (error) {
    console.error('Error getting water price:', error);
    return 5000; // Default to 5000 if there's an error
  }
}

// Server-side function to update setting
export async function updateSettingInDb(
  key: string,
  value: string,
  desc: string
): Promise<WebsiteSetting> {
  const setting = await db
    .insert(websiteSettings)
    .values({ key, value, desc })
    .onConflictDoUpdate({
      target: websiteSettings.key,
      set: { value, desc }
    })
    .returning()
    .then(rows => rows[0]);

  return setting;
}
