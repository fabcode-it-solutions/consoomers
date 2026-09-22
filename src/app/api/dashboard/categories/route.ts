/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { z } from "zod";
import { db, initializeConnection } from "@/db/db";
import { createCategories } from "@/db/schema/brands";
import { eq, sql } from "drizzle-orm";

const CreateCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = CreateCategorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    await initializeConnection();

    const { name, description } = validation.data;

    const [newCategory] = await db
      .insert(createCategories)
      .values({
        name: name.trim(),
        description: description?.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: newCategory,
        message: "Category created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating category:", error);
    if (error.message?.includes("unique")) {
      return NextResponse.json(
        { error: "Category name already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "1000");
    const search = searchParams.get("search") || "";
    const simpleList = searchParams.get("simple") === "true";

    await initializeConnection();

    // Build conditions
    const whereConditions = search
      ? sql`${createCategories.name} ILIKE ${`%${search}%`}`
      : undefined;

    // Build final query in one chain
    const allCategories = await db
      .select()
      .from(createCategories)
      .where(whereConditions);

    if (simpleList) {
      return NextResponse.json({
        success: true,
        data: allCategories,
      });
    }

    const offset = (page - 1) * limit;
    const paginatedCategories = allCategories.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: paginatedCategories,
      pagination: {
        page,
        limit,
        total: allCategories.length,
        totalPages: Math.ceil(allCategories.length / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}




