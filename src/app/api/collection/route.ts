/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { categories } from "@/db/schema/category";
import { media } from "@/db/schema/media";
import { eq, like } from "drizzle-orm";
export async function getHandle(name: string): Promise<string> {
  const baseHandle = name.trim().toLowerCase().replace(/\s+/g, "-");
  const existing = await db
    .select({ handle: categories.handle })
    .from(categories)
    .where(like(categories.handle, `${baseHandle}%`))
    .execute();

  if (existing.length === 0) return baseHandle;

  const suffixes = existing.map(({ handle }) => {
    const match = handle.match(new RegExp(`^${baseHandle}-(\\d+)$`));
    return match ? parseInt(match[1], 10) : 0;
  });

  const nextSuffix = Math.max(...suffixes) + 1;
  return `${baseHandle}-${nextSuffix}`;
}


export async function getUniqueName(name: string): Promise<string> {
  const baseName = name.trim();
  const existing = await db
    .select({ name: categories.name })
    .from(categories)
    .where(like(categories.name, `${baseName}%`))
    .execute();

  if (existing.length === 0) return baseName;

  const suffixes = existing.map(({ name }) => {
    const match = name.match(new RegExp(`^${baseName}-(\\d+)$`));
    return match ? parseInt(match[1], 10) : 0;
  });

  const nextSuffix = Math.max(...suffixes) + 1;
  return `${baseName}-${nextSuffix}`;
}


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, handle, description, userId, imageId } = body;

    if (!name || !userId) {
      return NextResponse.json(
        { success: false, message: "Name and userId are required" },
        { status: 400 }
      );
    }

    const finalName = await getUniqueName(name);
    const finalHandle = handle || (await getHandle(finalName));

    const [newCategory] = await db
      .insert(categories)
      .values({ name: finalName, handle: finalHandle, description, userId, imageId })
      .returning();

    return NextResponse.json(
      { success: true, message: "Category created successfully", category: newCategory },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error creating category:", err);
    return NextResponse.json(
      { success: false, message: "Failed to create category" },
      { status: 500 }
    );
  }
}


export async function GET(req: Request) {
  try {
    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        handle: categories.handle,
        description: categories.description,
        userId: categories.userId,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        image: {
          id: media.id,
          src: media.src,
          type: media.type,
          alt: media.alt,
        },
      })
      .from(categories)
      .leftJoin(media, eq(categories.imageId, media.id))
      .execute();
    return NextResponse.json(
      { success: true, message: "Categories fetched successfully", categories: result },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error fetching categories:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}


export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, handle, description, userId, imageId } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Category id is required" },
        { status: 400 }
      );
    }

    const finalName = name ? await getUniqueName(name) : undefined;
    const finalHandle = handle || (name ? await getHandle(finalName!) : undefined);

    const [updatedCategory] = await db
      .update(categories)
      .set({ name: finalName, handle: finalHandle, description, userId, imageId, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();

    if (!updatedCategory) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Category updated successfully", category: updatedCategory },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error updating category:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Category id is required" },
        { status: 400 }
      );
    }

    const deleted = await db.delete(categories).where(eq(categories.id, id)).returning();

    if (!deleted.length) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Category deleted successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error deleting category:", err);
    return NextResponse.json(
      { success: false, message: "Failed to delete category" },
      { status: 500 }
    );
  }
}
