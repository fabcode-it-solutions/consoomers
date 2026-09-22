/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { products } from "@/db/schema/products";
import { sampleRequests, testerProfiles } from "@/db/schema/tester";
import { testerActivity } from "@/db/schema/tester";
import { eq, and, desc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth/auth";

interface CreateSampleRequestBody {
  productId: string;
  notes?: string;
  shippingAddress?: string;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const testerId = searchParams.get("testerId");
    const productId = searchParams.get("productId");
    const status = searchParams.get("status");
    const isAdmin = session.user.role === "admin";

    let query = db
      .select({
        request: sampleRequests,
        product: products,
        tester: testerProfiles,
      })
      .from(sampleRequests)
      .leftJoin(products, eq(sampleRequests.productId, products.id))
      .leftJoin(testerProfiles, eq(sampleRequests.testerId, testerProfiles.id))
      .orderBy(desc(sampleRequests.requestedAt));

    const conditions = [];

    if (testerId) {
      conditions.push(eq(sampleRequests.testerId, testerId));
    } else if (!isAdmin) {
      const [profile] = await db
        .select()
        .from(testerProfiles)
        .where(eq(testerProfiles.userId, session.user.id!))
        .limit(1);

      if (profile) {
        conditions.push(eq(sampleRequests.testerId, profile.id));
      }
    }

    if (productId) {
      conditions.push(eq(sampleRequests.productId, productId));
    }

    if (status) {
      conditions.push(eq(sampleRequests.status, status as any));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const requests = await query;

    return NextResponse.json({
      requests,
      total: requests.length,
    });
  } catch (error) {
    console.error("GET /sample-requests error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sample requests" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateSampleRequestBody = await req.json();
    const { productId, notes, shippingAddress } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    if (!shippingAddress || shippingAddress.trim() === "") {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      );
    }

    // Get tester profile
    const [profile] = await db
      .select()
      .from(testerProfiles)
      .where(eq(testerProfiles.userId, session.user.id!))
      .limit(1);

    if (!profile) {
      return NextResponse.json(
        { error: "Tester profile not found" },
        { status: 404 }
      );
    }

    const testerId = profile.id;

    // Check if already requested
    const existing = await db
      .select()
      .from(sampleRequests)
      .where(
        and(
          eq(sampleRequests.testerId, testerId),
          eq(sampleRequests.productId, productId)
        )
      );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "You have already requested a sample for this product" },
        { status: 400 }
      );
    }

    // Create sample request
    const [request] = await db
      .insert(sampleRequests)
      .values({
        testerId,
        productId,
        notes: notes || null,
        shippingAddress: shippingAddress.trim(),
        status: "pending",
        requestedAt: new Date(), // Explicitly set requested timestamp
      })
      .returning();

    // Log activity
    await db.insert(testerActivity).values({
      testerId,
      activityType: "request_sample",
      productId,
      details: {
        requestId: request.id,
        notes: notes || "",
        timestamp: new Date().toISOString(),
      },
    });

    console.log("✅ Sample request created and activity logged:", request.id);

    return NextResponse.json({
      success: true,
      request,
      message: "Sample request submitted successfully!",
    });
  } catch (error) {
    console.error("POST /sample-requests error:", error);
    return NextResponse.json(
      { error: "Failed to create sample request" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { requestId, status, adminNotes, trackingNumber } = body;

    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = [
      "pending",
      "approved",
      "rejected",
      "shipped",
      "delivered",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Get current request to check state transitions
    const [currentRequest] = await db
      .select()
      .from(sampleRequests)
      .where(eq(sampleRequests.id, requestId))
      .limit(1);

    if (!currentRequest) {
      return NextResponse.json(
        { error: "Sample request not found" },
        { status: 404 }
      );
    }

    // Build update object
    const updates: any = { status };

    // Update admin notes if provided
    if (adminNotes !== undefined) {
      updates.adminNotes = adminNotes || null;
    }

    // Handle status-specific updates with proper timestamps
    switch (status) {
      case "approved":
        // Only set approvedAt if not already set (first approval)
        if (!currentRequest.approvedAt) {
          updates.approvedAt = new Date();
        }
        break;

      case "shipped":
        // Validate tracking number for shipped status
        if (!trackingNumber || trackingNumber.trim() === "") {
          return NextResponse.json(
            { error: "Tracking number is required for shipped status" },
            { status: 400 }
          );
        }
        updates.trackingNumber = trackingNumber.trim();

        // Set approvedAt if not set (in case we skip approved status)
        if (!currentRequest.approvedAt) {
          updates.approvedAt = new Date();
        }
        // Only set shippedAt if not already set
        if (!currentRequest.shippedAt) {
          updates.shippedAt = new Date();
        }
        break;

      case "delivered":
        // Set all previous timestamps if missing
        if (!currentRequest.approvedAt) {
          updates.approvedAt = new Date();
        }
        if (!currentRequest.shippedAt) {
          updates.shippedAt = new Date();
        }
        // Only set deliveredAt if not already set
        if (!currentRequest.deliveredAt) {
          updates.deliveredAt = new Date();
        }
        break;

      case "rejected":
        // No specific timestamp for rejected
        break;

      case "pending":
        // Reset back to pending (shouldn't happen often)
        updates.approvedAt = null;
        updates.shippedAt = null;
        updates.deliveredAt = null;
        updates.trackingNumber = null;
        break;
    }

    // Update tracking number if provided (even for non-shipped status updates)
    if (trackingNumber !== undefined && status !== "pending") {
      updates.trackingNumber = trackingNumber.trim() || null;
    }

    // Perform the update
    const [updated] = await db
      .update(sampleRequests)
      .set(updates)
      .where(eq(sampleRequests.id, requestId))
      .returning();

    console.log(` Sample request ${requestId} updated to status: ${status}`);

    return NextResponse.json({
      success: true,
      updatedRequest: updated,
      message: `Sample request ${
        status === "approved"
          ? "approved"
          : status === "rejected"
          ? "rejected"
          : "updated"
      } successfully`,
    });
  } catch (error) {
    console.error("PATCH /sample-requests error:", error);
    return NextResponse.json(
      { error: "Failed to update sample request" },
      { status: 500 }
    );
  }
}
