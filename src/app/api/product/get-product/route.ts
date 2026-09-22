import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { products } from "@/db/schema/products";
import { brands } from "@/db/schema/brands";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth/auth";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ products: [] }, { status: 401 });
    }

    const url = new URL(req.url);
    const brandIdParam = url.searchParams.get("brandId");
    const allParam = url.searchParams.get("all"); // 👈 new param

    // 1️⃣ If admin and brandId provided → show that brand's products
    if (session.user.role === "admin" && brandIdParam) {
      const brandProducts = await db
        .select()
        .from(products)
        .where(eq(products.brandId, brandIdParam))
        .execute();
      return NextResponse.json({ products: brandProducts });
    }

    // 🆕 1.5️⃣ If admin and wants all products → show everything
    if (session.user.role === "admin" && allParam === "true") {
      const allProducts = await db.select().from(products).execute();
      return NextResponse.json({ products: allProducts });
    }

    // 2️⃣ For regular brand user → show only their own products
    const [userBrand] = await db
      .select({ id: brands.id })
      .from(brands)
      .where(eq(brands.userId, session.user.id))
      .limit(1);

    if (!userBrand) {
      return NextResponse.json({ products: [] });
    }

    const userProducts = await db
      .select()
      .from(products)
      .where(eq(products.brandId, userBrand.id))
      .execute();

    return NextResponse.json({ products: userProducts });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ products: [] });
  }
}
