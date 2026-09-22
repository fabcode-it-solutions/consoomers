// app/api/dashboard/pending-survey/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { productReviews } from "@/db/schema/products";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testerId = searchParams.get("testerId");
    const productId = searchParams.get("productId");

    if (!testerId || !productId) {
      return NextResponse.json(
        { error: "testerId and productId required" },
        { status: 400 }
      );
    }

    // Check ANY review exists for product
    const existing = await db
      .select({
        id: productReviews.id,
        status: productReviews.status,
        testerId: productReviews.testerId,
      })
      .from(productReviews)
      .where(eq(productReviews.productId, productId));

    const reviewed = existing.length > 0;
    const latest = existing[0] ?? null;

    return NextResponse.json({
      reviewed,
      reviewStatus: latest ? latest.status : null,
      debug: {
        productId,
        reviewCount: existing.length,
        latest,
      },
    });

  } catch (error) {
    console.error("pending-survey error:", error);
    return NextResponse.json(
      { error: "Failed to load survey status" },
      { status: 500 }
    );
  }
}
