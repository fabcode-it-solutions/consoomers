
import { NextRequest, NextResponse } from "next/server";
import { eq, desc, inArray } from "drizzle-orm";
import { db } from "@/db/db";
import { productReviews } from "@/db/schema/products";
import { testerProfiles } from "@/db/schema/tester";
import { users } from "@/db/schema/users";
import { media } from "@/db/schema/media";
import { products } from "@/db/schema/products";

export async function GET(request: NextRequest) {
  try {
    const reviewsData = await db
      .select()
      .from(productReviews)
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
        let productName = "Unknown Product";

        try {
          const productInfo = await db
            .select({ name: products.name })
            .from(products)
            .where(eq(products.id, review.productId))
            .limit(1);

          if (productInfo.length > 0) {
            productName = productInfo[0].name;
          }
        } catch (err) {
          console.error("Error fetching product info:", err);
        }
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
          status: review.status || "pending",
          createdAt: review.createdAt,
          testerName,
          productName,
        };
      })
    );
    console.log("Fetched reviews:", formattedReviews);
    return NextResponse.json({ success: true, reviews: formattedReviews });
  } catch (error) {
    console.error("GET reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews", details: error },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, status } = body;

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    if (!status || !["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid status. Must be 'approved', 'rejected', or 'pending'",
        },
        { status: 400 }
      );
    }

    // Update review status
    const updatedReview = await db
      .update(productReviews)
      .set({ status })
      .where(eq(productReviews.id, reviewId))
      .returning();

    if (updatedReview.length === 0) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      review: updatedReview[0],
      message: `Review ${status} successfully`,
    });
  } catch (error) {
    console.error("PATCH review error:", error);
    return NextResponse.json(
      { error: "Failed to update review", details: error },
      { status: 500 }
    );
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("reviewId");

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
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
