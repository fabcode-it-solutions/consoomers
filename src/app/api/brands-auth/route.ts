import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { brands } from "@/db/schema/brands";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { brandId, password } = await req.json();

    if (!brandId || !password) {
      return NextResponse.json({ error: "Brand ID and password are required" }, { status: 400 });
    }

    const brand = await db
      .select({ accessPassword: brands.accessPassword })
      .from(brands)
      .where(eq(brands.id, brandId))
      .limit(1);

    if (!brand.length || !brand[0].accessPassword) {
      return NextResponse.json({ error: "Brand not found or no password set" }, { status: 404 });
    }

    if (password === brand[0].accessPassword) {
      const res = NextResponse.json({ success: true });
      res.cookies.set(`brand_access_${brandId}`, "granted", {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24, // valid for 1 day
      });
      return res;
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch (error) {
    console.error("Error authenticating brand:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

