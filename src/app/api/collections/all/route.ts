import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { products } from "@/db/schema/products";
import { brands } from "@/db/schema/brands";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allProducts = await db
      .select({
        id: products.id,
        handle: products.handle,
        name: products.name,
        description: products.description,
        category: products.category,
        tags: products.tags,
        media: products.media,
        price: products.price,
        brandId: products.brandId,
        createdBy: brands.userId,
      })
      .from(products)
      .innerJoin(brands, eq(products.brandId, brands.id))
      .innerJoin(users, eq(brands.userId, users.id))
      .where(eq(users.status, "active"))
      .execute();

    return NextResponse.json({ 
      success: true, 
      products: allProducts 
    });
  } catch (error) {
    console.error("Error fetching all products:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch products" 
      },
      { status: 500 }
    );
  }
}