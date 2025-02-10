import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { users, credentials } from "@/db/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

const createUserSchema = z.object({
  nik: z.string().length(16),
  name: z.string().min(2),
  region: z.string().min(2),
  address: z.string().min(5),
  role: z.enum(["admin", "officer", "user"]),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await req.json();
    const validatedData = createUserSchema.parse(body);

    // Check if NIK already exists in users table
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.nik, validatedData.nik))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "NIK already exists" },
        { status: 400 }
      );
    }

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        nik: validatedData.nik,
        name: validatedData.name,
        region: validatedData.region,
        address: validatedData.address,
        role: validatedData.role,
      })
      .returning();

    // Hash password and create credentials
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    await db.insert(credentials).values({
      userId: newUser.id,
      nik: validatedData.nik,
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request data", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("[USERS_POST]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const allUsers = await db
      .select({
        id: users.id,
        nik: users.nik,
        name: users.name,
        region: users.region,
        address: users.address,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.createdAt);

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("[USERS_GET]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
