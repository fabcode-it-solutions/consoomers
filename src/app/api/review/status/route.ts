import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db/db";
import { productReviews } from "@/db/schema/products";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const testerId = searchParams.get("testerId");
    const productId = searchParams.get("productId");

    if (!testerId || !productId) {
      return NextResponse.json(
        { error: "testerId and productId are required" },
        { status: 400 }
      );
    }

    const review = await db
      .select({
        id: productReviews.id,
        status: productReviews.status,
      })
      .from(productReviews)
      .where(
        and(
          eq(productReviews.testerId, testerId),
          eq(productReviews.productId, productId)
        )
      )
      .limit(1);

    if (review.length === 0) {
      return NextResponse.json({
        reviewed: false,
        reviewStatus: null,
      });
    }

    return NextResponse.json({
      reviewed: true,
      reviewStatus: review[0].status,
    });
  } catch (err) {
    console.error("STATUS API ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch review status" },
      { status: 500 }
    );
  }
}
