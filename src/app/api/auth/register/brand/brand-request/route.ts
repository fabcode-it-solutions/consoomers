import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { eq, sql, asc, desc } from "drizzle-orm";
import { brandCreate, brandRequests } from "@/db/schema/brands";
import { users } from "@/db/schema/users";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? asc : desc;

  const offset = (page - 1) * limit;

  try {
    const data = await db
      .select({
        id: brandRequests.id,
          brandId: brandCreate.id,     
        brandName: brandCreate.brandName,
        userName: users.username,
        createdAt: brandRequests.createdAt,
        countryFounded: brandCreate.countryFounded,
        currentOwnership: brandCreate.currentOwnership,
        status: brandRequests.status,
      })
      .from(brandRequests)
      .leftJoin(brandCreate, eq(brandRequests.brandId, brandCreate.id))
      .leftJoin(users, eq(brandRequests.userId, users.id))
      .where(
        search
          ? sql`${brandCreate.brandName} ILIKE ${"%" + search + "%"}`
          : undefined
      )
      .orderBy(
        sortOrder(
          sortBy === "userName"
            ? users.username
            : sortBy === "createdAt"
            ? brandRequests.createdAt
            : brandCreate.brandName
        )
      )
      .limit(limit)
      .offset(offset);

    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(brandRequests);
console.log(data,"data>>  ")
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        totalCount: total[0].count,
        totalPages: Math.ceil(total[0].count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching brand requests:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching brand requests" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { brandId, userId, status, notes, statusRecord } = body;

    if (!brandId || !userId) {
      return NextResponse.json(
        { success: false, error: "brandId and userId are required" },
        { status: 400 }
      );
    }

    const existingRequest = await db
      .select()
      .from(brandRequests)
      .where(eq(brandRequests.brandId, brandId));

    if (existingRequest.length > 0) {
      return NextResponse.json(
        { success: false, error: "A request already exists for this brand" },
        { status: 400 }
      );
    }

    const [newRequest] = await db
      .insert(brandRequests)
      .values({
        brandId,
        userId,
        status: status || "pending",
        notes,
        statusRecord,
      })
      .returning();

    return NextResponse.json({ success: true, data: newRequest });
  } catch (error) {
    console.error("Error creating brand request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create brand request" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status, userId, notes, statusRecord } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "id is required" },
        { status: 400 }
      );
    }

    const [updatedRequest] = await db
      .update(brandRequests)
      .set({
        ...(status && { status }),
        ...(userId && { userId }),
        ...(notes && { notes }),
        ...(statusRecord && { statusRecord: JSON.stringify(statusRecord) }),
        updatedAt: new Date(),
      })
      .where(eq(brandRequests.id, id))
      .returning();

    if (!updatedRequest) {
      return NextResponse.json(
        { success: false, error: "No record found with this id" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedRequest });
  } catch (error) {
    console.error("Error updating brand request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update brand request" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "id is required" },
        { status: 400 }
      );
    }

    await db.delete(brandRequests).where(eq(brandRequests.id, id));

    return NextResponse.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting brand request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete brand request" },
      { status: 500 }
    );
  }
}
