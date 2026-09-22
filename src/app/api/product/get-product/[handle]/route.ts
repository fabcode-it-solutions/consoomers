/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { db } from "@/db/db";
import { products, productVariants, productOptions } from "@/db/schema/products";
import { brands } from "@/db/schema/brands";
import { eq } from "drizzle-orm";
import { authOptions } from "@/libs/auth/auth";
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ handle: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { handle } = await context.params;

    if (!handle) {
      return NextResponse.json(
        { error: "Product handle required" },
        { status: 400 }
      );
    }

    // Fetch product with brand data
    const [productData] = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        category: products.category,
        tags: products.tags,
        media: products.media,
        price: products.price,
        handle: products.handle,
        brandId: products.brandId,
        brandData: products.brandLogo,
        brandName: brands.name,
        createdBy: brands.userId,
        sampleRequestsEnabled: products.sampleRequestsEnabled,
      })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(eq(products.handle, handle))
      .limit(1);

    if (!productData) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Variants
    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, productData.id));

    // Options
    const options = await db
      .select()
      .from(productOptions)
      .where(eq(productOptions.productId, productData.id));

  

    return NextResponse.json(
      {
        product: {
          ...productData,
          variants,
          options,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching product by handle:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
