import { db } from "@/db/db";
import { productReviews } from "@/db/schema/products";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await context.params; 
    const body = await request.json();
    const { testerId } = body;

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    if (!testerId) {
      return NextResponse.json(
        { error: "User must be logged in to delete review" },
        { status: 401 }
      );
    }

    const existingReview = await db
      .select()
      .from(productReviews)
      .where(eq(productReviews.id, reviewId))
      .limit(1);

    if (existingReview.length === 0) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    if (existingReview[0].testerId !== testerId) {
      return NextResponse.json(
        { error: "You can only delete your own reviews" },
        { status: 403 }
      );
    }

    await db.delete(productReviews).where(eq(productReviews.id, reviewId));

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("DELETE review error:", error);
    return NextResponse.json(
      { error: "Failed to delete review", details: error },
      { status: 500 }
    );
  }
}
