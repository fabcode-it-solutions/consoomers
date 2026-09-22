// app/api/dashboard/brand/[brandId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { brandCreate, brandRequests } from "@/db/schema/brands";
import { media } from "@/db/schema/media"; 
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> } 
) {
  const { brandId } = await params;  

  try {
    const [brand] = await db
      .select({
        id: brandCreate.id,
        brandName: brandCreate.brandName,
        countryFounded: brandCreate.countryFounded,
        currentOwnership: brandCreate.currentOwnership,
        status: brandRequests.status,
        logo: media,
        brandMedia: brandCreate.brandMedia,
        productData: brandCreate.products,
      })
      .from(brandCreate)
      .leftJoin(brandRequests, eq(brandRequests.brandId, brandCreate.id))
      .leftJoin(media, eq(media.id, brandCreate.logo))
      .where(eq(brandCreate.id, brandId));

    if (!brand) {
      return NextResponse.json(
        { success: false, message: "Brand not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: brand,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch brand" },
      { status: 500 }
    );
  }
}
