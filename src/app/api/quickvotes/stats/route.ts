// app/api/quickvotes/stats/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { quick_votes } from "@/db/schema/quickVote";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  try {
    const votes = await db.select({
      selected_options: quick_votes.selected_options
    }).from(quick_votes).where(eq(quick_votes.product_id, productId));

    const counts: Record<string, number> = {};
    for (const vote of votes) {
      const options = Array.isArray(vote.selected_options) ? vote.selected_options : [];
      for (const option of options) {
        counts[option] = (counts[option] || 0) + 1;
      }
    }

    return NextResponse.json({ stats: counts });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}