import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { productInteractions, products } from "@/db/schema/products";
import { users } from "@/db/schema/users";
import { eq, and, desc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth/auth";
import { testerActivity, testerProfiles } from "@/db/schema/tester";

// ✅ FIXED ROUTE SIGNATURE
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await context.params; // <-- IMPORTANT FIX

    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    const product = await db.select().from(products).where(eq(products.handle, handle));

    if (product.length === 0)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const productId = product[0].id;

    const likes = await db
      .select({
        testerId: productInteractions.testerId,
        likedAt: productInteractions.createdAt,
        name: users.username,
      })
      .from(productInteractions)
      .leftJoin(users, eq(productInteractions.testerId, users.id))
      .where(
        and(
          eq(productInteractions.productId, productId),
          eq(productInteractions.interactionType, "like")
        )
      )
      .orderBy(desc(productInteractions.createdAt));

    // Check if current user has liked this product
    const userLiked = currentUserId
      ? likes.some((like) => like.testerId === currentUserId)
      : false;

    return NextResponse.json({
      total: likes.length,
      likes,
      userLiked,
    });
  } catch (error) {
    console.error("GET /product/likes error:", error);
    return NextResponse.json({ error: "Failed to fetch likes" }, { status: 500 });
  }
}

// ✅ FIXED POST SIGNATURE
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ handle: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { handle } = await context.params; // <-- IMPORTANT FIX
    const testerId = session.user.id;

    if (!testerId)
      return NextResponse.json({ error: "No tester ID found" }, { status: 400 });

    const product = await db.select().from(products).where(eq(products.handle, handle));
    if (product.length === 0)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const productId = product[0].id;

    const existing = await db
      .select()
      .from(productInteractions)
      .where(
        and(
          eq(productInteractions.productId, productId),
          eq(productInteractions.testerId, testerId),
          eq(productInteractions.interactionType, "like")
        )
      );

    // Toggle unlike
    if (existing.length > 0) {
      await db
        .delete(productInteractions)
        .where(
          and(
            eq(productInteractions.productId, productId),
            eq(productInteractions.testerId, testerId),
            eq(productInteractions.interactionType, "like")
          )
        );

      return NextResponse.json({
        success: true,
        removed: true,
        message: "Like removed",
      });
    }

    // Add new like
    const [interaction] = await db
      .insert(productInteractions)
      .values({ productId, testerId, interactionType: "like" })
      .returning();

    // Log tester activity
    const profile = await db
      .select()
      .from(testerProfiles)
      .where(eq(testerProfiles.userId, testerId))
      .limit(1);

    const testerHashId = profile.length > 0 ? profile[0].id : null;

    if (testerHashId) {
      await db
        .insert(testerActivity)
        .values({
          testerId: testerHashId,
          activityType: "like",
          productId,
          details: { message: "Like product" },
        })
        .returning();
    }

    return NextResponse.json({
      success: true,
      added: true,
      interaction,
    });
  } catch (error) {
    console.error("POST /product/like error:", error);
    return NextResponse.json({ error: "Failed to like product" }, { status: 500 });
  }
}
