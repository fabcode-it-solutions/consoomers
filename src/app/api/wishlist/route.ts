import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { wishlist } from "@/db/schema";
import { products } from "@/db/schema/products";
import { brands } from "@/db/schema/brands";
import { eq, and, sql } from "drizzle-orm";
import { users } from "@/db/schema/users";
import { createProductWishlistNotification } from "@/utils/notificationHelper";
import notificationApi from "@/services/notificationApi";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    console.log("Wishlist GET request:", { userId, page, limit });

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(wishlist)
      .leftJoin(products, eq(wishlist.productId, products.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(users, eq(brands.userId, users.id))
      .where(
        and(
          eq(wishlist.userId, userId),
          eq(users.status, "active")
        )
      );

    const totalCount = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(totalCount / limit);

    const data = await db
      .select({
        id: wishlist.id,
        entityType: wishlist.entityType,
        userId: wishlist.userId,
        productId: wishlist.productId,
        brandId: products.brandId,
        createdAt: wishlist.createdAt,
        updatedAt: wishlist.updatedAt,
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          media: products.media,
          category: products.category,
          createdBy: brands.userId,
        },
      })
      .from(wishlist)
      .leftJoin(products, eq(wishlist.productId, products.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(users, eq(brands.userId, users.id))
      .where(
        and(
          eq(wishlist.userId, userId),
          eq(users.status, "active")
        )
      )
      .orderBy(wishlist.createdAt)
      .limit(limit)
      .offset(offset);

    console.log(`Found ${data.length} wishlist items for user ${userId}`);

    return NextResponse.json(
      {
        success: true,
        data,
        pagination: {
          page,
          limit,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET wishlist error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, productId, brandId, entityType } = body;

    console.log("Wishlist POST request:", {
      userId,
      productId,
      brandId,
      entityType,
    });

    if (!userId || !entityType) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: userId and entityType",
        },
        { status: 400 }
      );
    }

    if (entityType === "product" && !productId) {
      return NextResponse.json(
        { success: false, message: "Product ID required for product wishlist" },
        { status: 400 }
      );
    }

    if (entityType === "brand" && !brandId) {
      return NextResponse.json(
        { success: false, message: "Brand ID required for brand wishlist" },
        { status: 400 }
      );
    }

    // Build where conditions based on entity type
    const whereConditions = [
      eq(wishlist.userId, userId),
      eq(wishlist.entityType, entityType),
    ];

    if (entityType === "product" && productId) {
      whereConditions.push(eq(wishlist.productId, productId));
    }

    if (entityType === "brand" && brandId) {
      whereConditions.push(eq(products.brandId, brandId));
    }

    const whereClause = and(...whereConditions);

    // Check if item already exists
    const existing = await db
      .select()
      .from(wishlist)
      .where(whereClause)
      .limit(1);

    if (existing.length > 0) {
      // Remove from wishlist
      await db.delete(wishlist).where(whereClause);
      console.log("Removed from wishlist:", existing[0].id);
      return NextResponse.json(
        { success: true, message: "Removed from wishlist", action: "removed" },
        { status: 200 }
      );
    }

    // Add to wishlist
    const insertData: {
      userId: string;
      entityType: "product" | "brand";
      productId?: string | null;
      brandId?: string | null;
    } = {
      userId,
      entityType,
      productId: entityType === "product" ? productId : null,
      brandId: entityType === "brand" ? brandId : null,
    };

    const result = await db
      .insert(wishlist)
      .values(insertData)
      .returning({ id: wishlist.id });
    
    console.log("Added to wishlist:", result[0]?.id);

    // ✅ FIXED: Send notification after adding to wishlist
    if (entityType === "product" && productId) {
      try {
        // Get product details with owner info AND current user info
        const [productDetails] = await db
          .select({
            productId: products.id,
            productName: products.name,
            brandUserId: brands.userId,
          })
          .from(products)
          .leftJoin(brands, eq(products.brandId, brands.id))
          .where(eq(products.id, productId))
          .limit(1);

        // Get current user details (the one who wishlisted)
        const [currentUser] = await db
          .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            username: users.username,
          })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (productDetails && currentUser) {
          // Only send notification if user didn't wishlist their own product
          if (productDetails.brandUserId && productDetails.brandUserId !== userId) {
            // ✅ CORRECT: Pass all 6 required parameters
            const notificationPayload = createProductWishlistNotification(
              productDetails.brandUserId,          // 1. recipientId (product owner)
              productDetails.productId,             // 2. productId
              productDetails.productName || "Product", // 3. productName
              currentUser.id,                       // 4. senderId (current user)
              currentUser.firstName || currentUser.username || "Someone", // 5. senderName
              undefined                             // 6. senderAvatar (optional)
            );

            console.log("📤 Sending wishlist notification:", {
              to: productDetails.brandUserId,
              from: currentUser.id,
              product: productDetails.productName,
              payload: notificationPayload,
            });

            await notificationApi.createNotification(notificationPayload);
            
            console.log(`✅ Wishlist notification sent to ${productDetails.brandUserId}`);
          } else {
            console.log("ℹ️ Skipping notification: User wishlisted their own product");
          }
        } else {
          console.log("⚠️ Could not find product or user details for notification");
        }
      } catch (notifError) {
        console.error("❌ Failed to send wishlist notification:", notifError);
        // Don't fail the wishlist add if notification fails
      }
    }

    return NextResponse.json(
      { success: true, message: "Added to wishlist", action: "added" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST wishlist error:", error);

    // Handle specific database errors
    if (error instanceof Error) {
      if (
        error.message.includes("duplicate key") ||
        error.message.includes("unique constraint")
      ) {
        return NextResponse.json(
          { success: false, message: "Item already in wishlist" },
          { status: 409 }
        );
      }

      if (error.message.includes("foreign key")) {
        return NextResponse.json(
          { success: false, message: "Invalid user, product, or brand ID" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { userId, productId, entityType } = body;

    if (!userId || !productId || !entityType) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const whereConditions = [
      eq(wishlist.userId, userId),
      eq(wishlist.entityType, entityType),
      eq(wishlist.productId, productId),
    ];

    await db.delete(wishlist).where(and(...whereConditions));

    return NextResponse.json(
      { success: true, message: "Removed from wishlist" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}