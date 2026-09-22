// app/api/review/route.ts - Updated GET method
import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc, inArray } from "drizzle-orm";
import { db } from "@/db/db";
import { productReviews } from "@/db/schema/products";
import { testerProfiles } from "@/db/schema/tester";
import { users } from "@/db/schema/users";
import { media } from "@/db/schema/media";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const testerId = searchParams.get("testerId"); // Optional: filter by specific tester
    
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Build query conditions
    const conditions = [eq(productReviews.productId, productId)];
    
    // If testerId is provided, filter by that tester (returns all statuses for that tester)
    if (testerId) {
      conditions.push(eq(productReviews.testerId, testerId));
    }

    const reviewsData = await db
      .select()
      .from(productReviews)
      .where(and(...conditions))
      .orderBy(desc(productReviews.createdAt));

    const formattedReviews = await Promise.all(
      reviewsData.map(async (review) => {
        let testerName = "Anonymous User";

        try {
          const userInfo = await db
            .select({ userId: users.id })
            .from(users)
            .where(eq(users.id, review.testerId))
            .limit(1);

          if (userInfo.length > 0) {
            const testerInfo = await db
              .select({
                firstName: testerProfiles.firstName,
                lastName: testerProfiles.lastName,
              })
              .from(testerProfiles)
              .where(eq(testerProfiles.userId, userInfo[0].userId))
              .limit(1);

            if (testerInfo.length > 0) {
              testerName = `${testerInfo[0].firstName} ${testerInfo[0].lastName}`;
            }
          }
        } catch (err) {
          console.error("Error fetching tester info:", err);
        }

        // Fetch review images
        let imageObjects: { id: string; src: string; alt: string; format: string | null; type: string; key: string; }[] = [];

        if (Array.isArray(review.images) && review.images.length > 0) {
          imageObjects = await db
            .select({
              id: media.id,
              src: media.src,
              alt: media.alt,
              format: media.format,
              type: media.type,
              key: media.key,
            })
            .from(media)
            .where(inArray(media.id, review.images));
        }

        return {
          id: review.id,
          testerId: review.testerId,
          productId: review.productId,
          rate: review.rate,
          review: review.review,
          images: imageObjects,
          status: review.status,
          createdAt: review.createdAt,
          testerName,
        };
      })
    );

    return NextResponse.json({ success: true, reviews: formattedReviews });
  } catch (error) {
    console.error("GET reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews", details: error },
      { status: 500 }
    );
  }
}

// POST method remains the same...
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, rate, review, images, testerId } = body;

    if (!productId)
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );

    if (!testerId)
      return NextResponse.json(
        { error: "User must be logged in to submit review" },
        { status: 401 }
      );

    if (!rate)
      return NextResponse.json(
        { error: "Rating is required" },
        { status: 400 }
      );

    if (!review || !review.trim())
      return NextResponse.json(
        { error: "Review text is required" },
        { status: 400 }
      );
      
    const existingReview = await db
      .select()
      .from(productReviews)
      .where(
        and(
          eq(productReviews.productId, productId),
          eq(productReviews.testerId, testerId)
        )
      )
      .limit(1);

    if (existingReview.length > 0) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    const newReview = await db
      .insert(productReviews)
      .values({
        productId,
        testerId,
        rate: rate.toString(),
        review: review.trim(),
        images: Array.isArray(images) ? images : [],
        status: "pending",
      })
      .returning();

    return NextResponse.json({
      success: true,
      review: newReview[0],
      message:
        "Review submitted successfully! It will be visible after admin approval.",
    });
  } catch (error) {
    console.error("POST review error:", error);
    return NextResponse.json(
      { error: "Failed to submit review", details: error },
      { status: 500 }
    );
  }
}