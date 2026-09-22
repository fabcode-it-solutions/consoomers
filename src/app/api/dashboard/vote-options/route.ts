// app/api/dashboard/vote-options/route.ts
import { db } from "@/db/db";
import { vote_options } from "@/db/schema/quickVote";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

// Helper function to add no-cache headers
function noCacheHeaders() {
  return {
    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0'
  };
}

// POST - Create or Update vote options
export async function POST(request: Request) {
  try {
    const { productId, options } = await request.json();

    if (!productId || !Array.isArray(options) || options.length === 0) {
      return NextResponse.json(
        { error: "productId and options are required" },
        { status: 400, headers: noCacheHeaders() }
      );
    }

    console.log(`Saving vote options for product ${productId}:`, options);

    // Check if existing vote options exist for this product
    const existing = await db
      .select()
      .from(vote_options)
      .where(eq(vote_options.product_id, productId));

    let result;
    
    if (existing.length > 0) {
      // Update existing record
      const [updated] = await db
        .update(vote_options)
        .set({ 
          options,
      
        })
        .where(eq(vote_options.product_id, productId))
        .returning();

      result = updated;
      console.log(`Updated vote options for product ${productId}:`, updated);
    } else {
      // Insert new record
      const [inserted] = await db
        .insert(vote_options)
        .values({ 
          product_id: productId, 
          options 
        })
        .returning();

      result = inserted;
      console.log(`Inserted vote options for product ${productId}:`, inserted);
    }

    return NextResponse.json(
      { 
        ok: true, 
        voteOptions: result,
        options: result.options 
      },
      { headers: noCacheHeaders() }
    );
  } catch (error) {
    console.error("POST /api/dashboard/vote-options error:", error);
    return NextResponse.json(
      { error: "Failed to save vote options" },
      { status: 500, headers: noCacheHeaders() }
    );
  }
}

// GET - Fetch vote options for a product
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400, headers: noCacheHeaders() }
      );
    }

    const [voteOptions] = await db
      .select()
      .from(vote_options)
      .where(eq(vote_options.product_id, productId))
      .limit(1);

    if (!voteOptions) {
      return NextResponse.json(
        { 
          voteOptions: null, 
          options: [] 
        },
        { headers: noCacheHeaders() }
      );
    }

    // Parse options safely in case it's a string
    let parsedOptions = voteOptions.options;
    if (typeof parsedOptions === "string") {
      try {
        parsedOptions = JSON.parse(parsedOptions);
      } catch {
        parsedOptions = [];
      }
    }

    console.log(`Retrieved vote options for product ${productId}:`, parsedOptions);

    return NextResponse.json(
      {
        ok: true,
        voteOptions: { ...voteOptions, options: parsedOptions },
        options: parsedOptions,
      },
      { headers: noCacheHeaders() }
    );
  } catch (error) {
    console.error("GET /api/dashboard/vote-options error:", error);
    return NextResponse.json(
      { error: "Failed to fetch vote options" },
      { status: 500, headers: noCacheHeaders() }
    );
  }
}

// PUT - Update vote options for a product
export async function PUT(request: Request) {
  try {
    const { productId, options } = await request.json();

    if (!productId || !Array.isArray(options)) {
      return NextResponse.json(
        { error: "Invalid request: productId and options required" },
        { status: 400, headers: noCacheHeaders() }
      );
    }

    // Update or insert new vote options
    const existing = await db
      .select()
      .from(vote_options)
      .where(eq(vote_options.product_id, productId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(vote_options)
        .set({ 
          options,
        })
        .where(eq(vote_options.product_id, productId));
    } else {
      await db.insert(vote_options).values({
        product_id: productId,
        options,
      });
    }

    return NextResponse.json(
      { ok: true },
      { headers: noCacheHeaders() }
    );
  } catch (error) {
    console.error("PUT /api/dashboard/vote-options error:", error);
    return NextResponse.json(
      { error: "Failed to update vote options" },
      { status: 500, headers: noCacheHeaders() }
    );
  }
}

// DELETE - Remove vote options for a product
export async function DELETE(request: Request) {
  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400, headers: noCacheHeaders() }
      );
    }

    console.log(`Deleting vote options for product ${productId}`);

    // Delete vote options for the product
    const deleted = await db
      .delete(vote_options)
      .where(eq(vote_options.product_id, productId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Vote options not found for this product" },
        { status: 404, headers: noCacheHeaders() }
      );
    }

    console.log(`Deleted vote options for product ${productId}`);

    return NextResponse.json(
      { 
        ok: true, 
        message: "Vote options deleted successfully",
        deleted: deleted[0]
      },
      { headers: noCacheHeaders() }
    );
  } catch (error) {
    console.error("DELETE /api/dashboard/vote-options error:", error);
    return NextResponse.json(
      { error: "Failed to delete vote options" },
      { status: 500, headers: noCacheHeaders() }
    );
  }
}