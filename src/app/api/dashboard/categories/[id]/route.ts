/* eslint-disable @typescript-eslint/no-explicit-any */
import { db, initializeConnection } from "@/db/db";
import { createCategories } from "@/db/schema/brands";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const UpdateCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
});

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // FIX

    const body = await req.json();
    const validation = UpdateCategorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    await initializeConnection();
    const { name, description } = validation.data;

    const [updatedCategory] = await db
      .update(createCategories)
      .set({
        name: name.trim(),
        description: description?.trim(),
        updatedAt: new Date(),
      })
      .where(eq(createCategories.id, id))
      .returning();

    if (!updatedCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: "Category updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating category:", error);
    if (error.message?.includes("unique")) {
      return NextResponse.json(
        { error: "Category name already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // FIX

    await initializeConnection();

    const [deletedCategory] = await db
      .delete(createCategories)
      .where(eq(createCategories.id, id))
      .returning();

    if (!deletedCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: deletedCategory,
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
