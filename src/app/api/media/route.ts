import { db } from "@/db/db";
import { media } from "@/db/schema/media";
import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
export const revalidate = 300;
export async function POST(req: Request) {
  const { src, type, alt, userId, name, result, key } = await req.json();

  if (!src || !type || !alt || !userId || !name || !key) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }

  // Insert media and return UUID string
  const [created] = await db
    .insert(media)
    .values({
      src,
      type,
      alt,
      userId,
      name,
      width: result.metadata?.width,
      size: result.metadata?.sizeFormatted,
      height: result.metadata?.height,
      format: result.metadata?.format,
      key: key,
    })
    .returning({ id: media.id });
  revalidateTag("media-list");
  return new Response(JSON.stringify({ id: created.id, media: created }), {
    status: 201,
  });
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const isPublic = searchParams.get("isPublic");
    const isArchived = searchParams.get("isArchived");
    const userId = searchParams.get("userId");

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];

    if (type && type !== "all") {
      whereConditions.push(like(media.type, `%${type}%`));
    }

    if (userId) {
      whereConditions.push(eq(media.userId, userId));
    }

    if (isPublic !== null && isPublic !== "all") {
      whereConditions.push(eq(media.isPublic, isPublic === "true"));
    }

    if (isArchived !== null && isArchived !== "all") {
      whereConditions.push(eq(media.isArchived, isArchived === "true"));
    }

    if (search) {
      whereConditions.push(
        or(like(media.alt, `%${search}%`), like(media.src, `%${search}%`))
      );
    }
    const where =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;
    // Build query
    const query = db
      .select()
      .from(media)
      .where(where)
      .orderBy(desc(media.createdAt))
      .limit(limit)
      .offset(offset);

    const results = await query;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql`count(*)` })
      .from(media)
      .where(and(...whereConditions));
    const countsByType = await db
      .select({
        type: media.type,
        count: sql`count(*)`.as("count"),
      })
      .from(media)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(media.type);

    // Convert into a friendlier object { image: X, video: Y, document: Z }
    const typeCounts: Record<string, number> = {};
    countsByType.forEach((row) => {
      typeCounts[row.type] = Number(row.count);
    });

    const totalItems = Number(count || 0);
    const totalCount =
      typeof count === "number" ? count : parseInt(count as string);
    const totalPages = Math.ceil(totalItems / limit);
    return NextResponse.json({
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalItems: totalItems,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      counts: {
        images: typeCounts["image"] || 0,
        videos: typeCounts["video"] || 0,
        documents: typeCounts["document"] || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}
