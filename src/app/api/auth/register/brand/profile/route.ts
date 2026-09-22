import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/db";
import { brands } from "@/db/schema/brands";
import { media } from "@/db/schema/media";
import { withCSRFProtection } from "@/libs/csrf/csrfMiddleware";


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const brandProfile = await db
      .select({
        id: brands.id,
        userId: brands.userId,
        name: brands.name,
        brandName: brands.brandName,
        website: brands.website,
        industry: brands.industry,
        position: brands.position,
        category: brands.category,
        sellingInUS: brands.sellingInUS,
        goals: brands.goals,
        handle: brands.handle,
        brandNum: brands.brandNum,
        createdAt: brands.createdAt,
        updatedAt: brands.updatedAt,
        preferences: brands.preferences,
      })
      .from(brands)
      .leftJoin(media, eq(brands.coverImage, media.id))
      .where(eq(brands.userId, userId))
      .limit(1);

    if (!brandProfile || brandProfile.length === 0) {
      return NextResponse.json(
        { error: "Brand profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      brandProfile: brandProfile[0],
    });
  } catch (error) {
    console.error("Error fetching brand profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  const csrf = await withCSRFProtection(req);
  if (csrf) return csrf;
  try {
    const body = await req.json();
    const {
      userId,
      name,
      brandName,
      website,
      industry,
      position,
      category,
      sellingInUS,
      goals,
      handle,
      preferences,
      coverImageId,
    } = body;

    if (!userId || !name || !handle) {
      return NextResponse.json(
        { error: "User ID, name, and handle are required" },
        { status: 400 }
      );
    }

    const existingBrand = await db
      .select()
      .from(brands)
      .where(eq(brands.userId, userId))
      .limit(1);

    if (existingBrand.length > 0) {
      return NextResponse.json(
        { error: "Brand profile already exists for this user" },
        { status: 409 }
      );
    }

    const existingHandle = await db
      .select()
      .from(brands)
      .where(eq(brands.handle, handle))
      .limit(1);

    if (existingHandle.length > 0) {
      return NextResponse.json(
        { error: "Handle already taken" },
        { status: 409 }
      );
    }

    const newBrand = await db
      .insert(brands)
      .values({
        userId,
        name,
        brandName: brandName || "",
        website: website || null,
        industry: industry || null,
        position: position || null,
        category: category || null,
        sellingInUS: sellingInUS || "",
        goals: goals || [],
        handle,
        preferences: preferences || {},
        coverImage: coverImageId || null,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Brand profile created successfully",
        brandProfile: newBrand[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating brand profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function PATCH(req: NextRequest) {

  const csrf = await withCSRFProtection(req);
  if (csrf) return csrf;

  try {
    const body = await req.json();
    const {
      userId,
      name,
      brandName,
      website,
      industry,
      position,
      category,
      sellingInUS,
      goals,
      handle,
      preferences,
      coverImageId,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const existingBrand = await db
      .select()
      .from(brands)
      .where(eq(brands.userId, userId))
      .limit(1);

    if (!existingBrand.length) {
      return NextResponse.json(
        { error: "Brand profile not found" },
        { status: 404 }
      );
    }

    // Handle uniqueness check
    if (handle && handle !== existingBrand[0].handle) {
      const handleExists = await db
        .select()
        .from(brands)
        .where(eq(brands.handle, handle))
        .limit(1);

      if (handleExists.length > 0) {
        return NextResponse.json(
          { error: "Handle already taken" },
          { status: 409 }
        );
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { updatedAt: new Date() };

    if (name !== undefined) updateData.name = name;
    if (brandName !== undefined) updateData.brandName = brandName;
    if (website !== undefined) updateData.website = website;
    if (industry !== undefined) updateData.industry = industry;
    if (position !== undefined) updateData.position = position;
    if (category !== undefined) updateData.category = category;
    if (sellingInUS !== undefined) updateData.sellingInUS = sellingInUS;
    if (goals !== undefined) updateData.goals = goals;
    if (handle !== undefined) updateData.handle = handle;
    if (preferences !== undefined) updateData.preferences = preferences;
    if (coverImageId !== undefined) updateData.coverImage = coverImageId;

    const updatedBrand = await db
      .update(brands)
      .set(updateData)
      .where(eq(brands.userId, userId))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Brand profile updated successfully",
      brandProfile: updatedBrand[0],
    });
  } catch (error) {
    console.error("Error updating brand profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ------------------------
// DELETE (CSRF REQUIRED)
// ------------------------
export async function DELETE(req: NextRequest) {
  // 🔐 CSRF PROTECTION
  const csrf = await withCSRFProtection(req);
  if (csrf) return csrf;

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const existingBrand = await db
      .select()
      .from(brands)
      .where(eq(brands.userId, userId))
      .limit(1);

    if (!existingBrand.length) {
      return NextResponse.json(
        { error: "Brand profile not found" },
        { status: 404 }
      );
    }

    await db.delete(brands).where(eq(brands.userId, userId));

    return NextResponse.json({
      success: true,
      message: "Brand profile deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting brand profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
