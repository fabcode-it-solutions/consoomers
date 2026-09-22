import { unlink } from "fs/promises";
import { db } from "@/db/db";
import { media } from "@/db/schema/media";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { join } from "path";
import { deleteFile } from "@/actions/upload";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const mediaId = pathSegments[pathSegments.length - 1]; 

    const [mediaItem] = await db
      .select()
      .from(media)
      .where(eq(media.id, mediaId))
      .limit(1);

    if (!mediaItem) {
      return NextResponse.json(
        { success: false, error: "Media not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: mediaItem });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const mediaId = pathSegments[pathSegments.length - 1];

    const body = await req.json();

    const [existing] = await db
      .select()
      .from(media)
      .where(eq(media.id, mediaId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Media not found" },
        { status: 404 }
      );
    }

    const updateMediaSchema = z.object({
      entityType: z.string().max(50).optional().nullable(),
      entityId: z.string().uuid().optional().nullable(), // if you use UUIDs for entityId
      title: z.string().max(255).optional(),
      altText: z.string().max(500).optional(),
      caption: z.string().optional(),
      credit: z.string().max(255).optional(),
      folder: z.string().max(255).optional(),
      tags: z.array(z.string()).optional(),
      metadata: z.any().optional(),
      isPublic: z.boolean().optional(),
      isArchived: z.boolean().optional(),
      displayOrder: z.number().int().optional(),
    });

    const validated = updateMediaSchema.parse(body);

    const [updatedMedia] = await db
      .update(media)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(media.id, mediaId))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedMedia,
      message: "Media updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    console.error("Error updating media:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update media" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const mediaId = pathSegments[pathSegments.length - 1];

    // Get media item
    const [mediaItem] = await db
      .select()
      .from(media)
      .where(eq(media.id, mediaId))
      .limit(1);

    if (!mediaItem) {
      return NextResponse.json(
        { success: false, error: "Media not found" },
        { status: 404 }
      );
    }

    // Delete media record
    await db.delete(media).where(eq(media.id, mediaId));
    if (media.key) {
      const data = await deleteFile(String(media.key));
      console.log(data);
    }
    return NextResponse.json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
