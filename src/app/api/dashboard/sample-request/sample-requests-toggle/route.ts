/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/dashboard/sample-requests-toggle/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { sql } from "drizzle-orm";  // Ensure this is imported
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth/auth";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { productId, enabled } = body;

    if (!productId || typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    // Use raw SQL to update (unchanged, as it works for single updates)
    await db.execute(sql`
      UPDATE products 
      SET sample_requests_enabled = ${enabled}
      WHERE id = ${productId}::uuid
    `);

    // Fetch updated product
    const result = await db.execute(sql`
      SELECT id, name, sample_requests_enabled
      FROM products 
      WHERE id = ${productId}::uuid
    `);

    const updated = result.rows[0];

    console.log(`✅ Sample requests ${enabled ? "enabled" : "disabled"} for product: ${updated.name}`);

    return NextResponse.json({
      success: true,
      product: updated,
      message: `Sample requests ${enabled ? "enabled" : "disabled"} successfully`,
    });
  } catch (error: any) {
    console.error("PATCH error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { productIds, enabled } = body;

    if (!Array.isArray(productIds) || typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    // ---- FIX: Build ARRAY[...] manually ----
    const arraySql = sql`
      ARRAY[
        ${sql.join(productIds.map(id => sql`${id}`), sql`, `)}
      ]::uuid[]
    `;

    await db.execute(sql`
      UPDATE products
      SET sample_requests_enabled = ${enabled}
      WHERE id = ANY(${arraySql})
    `);

    return NextResponse.json({
      success: true,
      count: productIds.length,
      message: `Sample requests ${enabled ? "enabled" : "disabled"} for ${productIds.length} products`,
    });
  } catch (error: any) {
    console.error("POST error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

