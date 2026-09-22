/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { products } from "@/db/schema/products";
import { brands } from "@/db/schema/brands";
import { brandCreate } from "@/db/schema/brands";
import { media } from "@/db/schema/media";
import { users } from "@/db/schema/users";
import { eq, inArray, and } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const handle = url.searchParams.get("handle");

    if (!handle) {
      return NextResponse.json(
        { error: "handle query param is required" },
        { status: 400 }
      );
    }

    const [brandResult] = await db
      .select({
        id: brands.id,
        brandName: brands.brandName,
        category: brands.category,
        sellingInUS: brands.sellingInUS,
        goals: brands.goals,
        website: brands.website,
        handle: brands.handle,
        logo: brands.logo,
        preferences: brands.preferences,
        brandImages: brands.brandImages,
        description: brands.description,
        userId: brands.userId,
      })
      .from(brands)
      .innerJoin(users, eq(brands.userId, users.id))
      .where(and(
        eq(brands.handle, handle),
        eq(users.status, "active")
      ))
      .limit(1);

    if (!brandResult) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Fetch brandCreate data for dynamic logo and brandMedia
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
      .where(eq(brandCreate.userId, brandResult.userId))
      .limit(1);

    // Fetch full media objects for brandImages if they contain UUIDs
    let brandImagesData = brandResult.brandImages;
    if (brandResult.brandImages && Array.isArray(brandResult.brandImages) && brandResult.brandImages.length > 0) {
      // Check if first item looks like a UUID
      const firstItem = brandResult.brandImages[0];
      if (typeof firstItem === 'string' && firstItem.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        // Fetch media objects for all IDs in a single query
        const mediaResults = await db
          .select({
            id: media.id,
            alt: media.alt,
            key: media.key,
            src: media.src,
            name: media.name,
            size: media.size,
            type: media.type,
            width: media.width,
            format: media.format,
            height: media.height,
            userId: media.userId,
            isPublic: media.isPublic,
            createdAt: media.createdAt,
            updatedAt: media.updatedAt,
            isArchived: media.isArchived,
          })
          .from(media)
          .where(inArray(media.id, brandResult.brandImages));
        
        brandImagesData = mediaResults;
      }
    }

    // Extract logo from preferences if it exists there
    const brand = {
      ...brandResult,
      logo: (brandResult.preferences as any)?.logo || brandResult.logo,
      brandImages: brandImagesData,
      brandCreateData: brandCreateResult ? {
        brandMedia: brandCreateResult.brandMedia,
        logo: brandCreateResult.logoData,
        logoUrl: brandCreateResult.logoData?.src,
      } : null,
    };



    const brandProducts = await db
      .select({
        id: products.id,
        handle: products.handle,
        name: products.name,
        description: products.description,
        category: products.category,
        tags: products.tags,
        media: products.media,
        price: products.price,
        logo: brands.logo,
        brandImages: brands.brandImages,
        createdBy: brands.userId,
      })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(users, eq(brands.userId, users.id))
      .where(and(
        eq(products.brandId, brandResult.id),
        eq(users.status, "active")
      ))
      .execute();

    return NextResponse.json({
      success: true,
      brand,
      products: brandProducts,
    });
  } catch (err: any) {
    console.error("Error fetching brand products:", err);
    return NextResponse.json(
      { error: "Failed to fetch brand products" },
      { status: 500 }
    );
  }
}
