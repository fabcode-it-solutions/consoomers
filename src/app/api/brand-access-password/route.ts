import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { brands } from "@/db/schema/brands";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brandId");
    const password = searchParams.get("password");

    if (!brandId || !password) {
      return NextResponse.json({ error: "Brand ID and password are required" }, { status: 400 });
    }

    // Try to find brand by userId first, then by brand id
    let brand = await db
      .select({ accessPassword: brands.accessPassword })
      .from(brands)
      .where(eq(brands.userId, brandId))
      .limit(1);

    // If not found by userId, try by brand id
    if (!brand.length) {
      brand = await db
        .select({ accessPassword: brands.accessPassword })
        .from(brands)
        .where(eq(brands.id, brandId))
        .limit(1);
    }

    if (!brand.length || !brand[0].accessPassword) {
      return NextResponse.json({ error: "Brand not found or no password set" }, { status: 404 });
    }

    if (password === brand[0].accessPassword) {
      return NextResponse.json({ success: true, authenticated: true });
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch (error) {
    console.error("Error validating brand access password:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { brandId, accessPassword } = await req.json();

    if (!brandId) {
      return NextResponse.json({ error: "Brand ID is required" }, { status: 400 });
    }

    // Update the brand record associated with the user
    const result = await db
      .update(brands)
      .set({ 
        accessPassword: accessPassword || null,
        updatedAt: new Date()
      })
      .where(eq(brands.userId, brandId))
      .returning({ id: brands.id });

    if (result.length === 0) {
      return NextResponse.json({ error: "Brand not found for this user" }, { status: 404 });
    }

   return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating brand access password:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}