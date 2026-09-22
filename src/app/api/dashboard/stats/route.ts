import { db } from "@/db/db";
import { quick_votes } from "@/db/schema";
import { products } from "@/db/schema/products";
import { users } from "@/db/schema/users";
import { brandRequests, brands } from "@/db/schema/brands";


import { desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dateFilter(table: any, range: string) {
  if (range === "24h") return sql`${table.createdAt} >= NOW() - interval '24 hours'`;
  if (range === "7d") return sql`${table.createdAt} >= NOW() - interval '7 days'`;
  if (range === "30d") return sql`${table.createdAt} >= NOW() - interval '30 days'`;
  return undefined;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("timeRange") || "all";

    // ---- TOTAL USERS ----
    const totalUsersPromise = db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users);

    // ---- TOTAL VOTES ----
    const totalVotesPromise = db
      .select({ count: sql<number>`COUNT(*)` })
      .from(quick_votes);


    const totalBrandsPromise = db
      .select({ count: sql<number>`COUNT(*)` })
      .from(brands);


    const totalProductsPromise = db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products);

   
    const pendingBrandRequestsPromise = db
      .select({ count: sql<number>`COUNT(*)` })
      .from(brandRequests)
      .where(eq(brandRequests.status, "pending"));

  
    const votesInPeriodPromise = db
      .select({
        date: sql<string>`DATE(${quick_votes.created_at})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(quick_votes)
      .groupBy(sql`DATE(${quick_votes.created_at})`)
      .orderBy(sql`DATE(${quick_votes.created_at})`);

    // ---- LATEST 20 VOTES ----
    const latestVotesPromise = db
      .select({
        id: quick_votes.id,
        userId: quick_votes.user_id,
        productId: quick_votes.product_id,
        selectedOptions: quick_votes.selected_options,
        createdAt: quick_votes.created_at,
        firstName: users.firstName,
        lastName: users.lastName,
        username: users.username,
        productName: products.name,
      })
      .from(quick_votes)
      .leftJoin(users, eq(quick_votes.user_id, users.id))
      .leftJoin(products, eq(quick_votes.product_id, products.id))
      .orderBy(desc(quick_votes.created_at))
      .limit(20);

    // ---- EXECUTE ALL ----
    const [
      totalUsers,
      totalVotes,
      totalBrands,
      totalProducts,
      pendingBrandRequests,
      votesInPeriod,
      latestVotes,
    ] = await Promise.all([
      totalUsersPromise,
      totalVotesPromise,
      totalBrandsPromise,
      totalProductsPromise,
      pendingBrandRequestsPromise,
      votesInPeriodPromise,
      latestVotesPromise,
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: totalUsers[0]?.count ?? 0,
        totalVotes: totalVotes[0]?.count ?? 0,
        totalBrands: totalBrands[0]?.count ?? 0,
        totalProducts: totalProducts[0]?.count ?? 0,
        pendingBrandRequests: pendingBrandRequests[0]?.count ?? 0,
        votesInPeriod,
        latestVotes,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch dashboard stats", error },
      { status: 500 }
    );
  }
}
