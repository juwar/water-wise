import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { or, ilike } from "drizzle-orm";

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

    const searchResults = await db
      .select({
        id: users.id,
        name: users.name,
        nik: users.nik,
        region: users.region,
      })
      .from(users)
      .where(
        or(
          ilike(users.name, `%${query}%`),
          ilike(users.nik, `%${query}%`)
        )
      )
      .limit(10);

    return NextResponse.json({ users: searchResults });
  } catch (error) {
    console.error("[USERS_SEARCH]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
