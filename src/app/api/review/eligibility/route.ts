import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db/db";
import { sampleRequests, testerProfiles } from "@/db/schema/tester";
import { productReviews } from "@/db/schema/products";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id; 
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { eligible: false, error: "Missing productId" },
        { status: 400 }
      );
    }
    const [profile] = await db
      .select()
      .from(testerProfiles)
      .where(eq(testerProfiles.userId, userId))
      .limit(1);

    if (!profile) {
      return NextResponse.json({
        eligible: false,
        hasReceived: false,
        reason: "Tester profile not found",
      });
    }

    const testerId = profile.id; 
    const sample = await db
      .select()
      .from(sampleRequests)
      .where(
        and(
          eq(sampleRequests.testerId, testerId),
          eq(sampleRequests.productId, productId)
        )
      )
      .limit(1);

    if (sample.length === 0) {
      return NextResponse.json({
        eligible: false,
        hasReceived: false,
        reason: "No sample request found",
      });
    }
    const delivered = sample[0].status?.toLowerCase() === "delivered";

    if (!delivered) {
      return NextResponse.json({
        eligible: false,
        hasReceived: false,
        reason: "Product has not been delivered",
      });
    }
    const review = await db
      .select()
      .from(productReviews)
      .where(
        and(
          eq(productReviews.productId, productId),
          eq(productReviews.testerId, testerId)
        )
      )
      .limit(1);

    const hasApprovedReview =
      review.length > 0 && review[0].status === "approved";

    return NextResponse.json({
      eligible: review.length === 0,
      hasReceived: true,
      hasApprovedReview,
    });
  } catch (error) {
    console.error("Eligibility error:", error);
    return NextResponse.json(
      { eligible: false, error: "Server error" },
      { status: 500 }
    );
  }
}
