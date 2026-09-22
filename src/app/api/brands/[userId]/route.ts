import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { brands, brandCreate } from "@/db/schema/brands";
import { media } from "@/db/schema/media";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;

  try {
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }
    const userBrands = await db
      .select({
        id: brands.id,
        userId: brands.userId,
        name: brands.name,
        handle: brands.handle,
        website: brands.website,
        industry: brands.industry,
        position: brands.position,
        category: brands.category,
        preferences: brands.preferences,
        coverImage: brands.coverImage,
        brandName: brands.brandName,
        logo:brands.logo,
        brandImages:brands.brandImages,
        description:brands.description,
        sellingInUS: brands.sellingInUS,
        goals: brands.goals,
        createdAt: brands.createdAt,
      })
      .from(brands)
      .where(eq(brands.userId, userId));

    // Fetch brandCreate data for each brand
    const brandsWithCreateData = await Promise.all(
      userBrands.map(async (brand) => {
        const [brandCreateResult] = await db
          .select({
            brandMedia: brandCreate.brandMedia,
            logo: brandCreate.logo,
            logoData: {
              id: media.id,
              src: media.src,
              type: media.type,
              name: media.name,
            },
          })
          .from(brandCreate)
          .leftJoin(media, eq(brandCreate.logo, media.id))
          .where(eq(brandCreate.userId, brand.userId))
          .limit(1);

        return {
          ...brand,
          brandCreateData: brandCreateResult ? {
            brandMedia: brandCreateResult.brandMedia,
            logo: brandCreateResult.logoData,
            logoUrl: brandCreateResult.logoData?.src,
          } : null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: brandsWithCreateData,
      count: brandsWithCreateData.length,
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;

  try {
    const body = await req.json();
    console.log("Received body:", body);
    console.log("User ID:", userId);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const {
      name,
      website,
      industry,
      position,
      category,
      preferences,
      coverImage,
      brandName,
      sellingInUS,
      goals,
      logo,
      brandImages,
      description,
    } = body;

    if (!name || !brandName) {
      return NextResponse.json(
        { success: false, error: "name and brandName are required" },
        { status: 400 }
      );
    }

    // Generate handle from brandName, ensure it's unique
    let handle = brandName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (!handle) {
      handle = `brand-${Date.now()}`;
    }

    // Check if handle already exists and make it unique
    const existingBrand = await db
      .select({ handle: brands.handle })
      .from(brands)
      .where(eq(brands.handle, handle))
      .limit(1);

    if (existingBrand.length > 0) {
      handle = `${handle}-${Date.now()}`;
    }

    console.log("Final handle:", handle);

    const brandData = {
      userId,
      handle,
      name,
      website: website || null,
      industry: industry || null,
      position: position || null,
      category: category || null,
      preferences: preferences ? (typeof preferences === 'string' ? JSON.parse(preferences) : preferences) : {
        logo: logo || null // Store logo in preferences temporarily
      },
      coverImage: coverImage || null,
      brandName,
      sellingInUS: sellingInUS ? 'true' : 'false',
      goals: goals ? (Array.isArray(goals) ? goals : [goals]) : [],
      createdAt: new Date(),
      logo: null, // Keep as null since schema expects UUID
      brandImages: brandImages || [],
      description: description || null,
    };

    console.log("Brand data to insert:", brandData);

    const newBrand = await db
      .insert(brands)
      .values(brandData)
      .returning();

    console.log("Brand created successfully:", newBrand[0]);

    return NextResponse.json({
      success: true,
      message: "Brand created successfully",
      data: newBrand[0],
    });
  } catch (error) {
    console.error("Detailed error creating brand:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create brand" },
      { status: 500 }
    );
  }
}

 