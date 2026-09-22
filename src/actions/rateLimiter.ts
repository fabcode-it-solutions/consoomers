"use server";
import { db } from "@/db/db";
import { rateLimits } from "@/db/schema/rateLimits";
import { and, eq, gte } from "drizzle-orm";

export interface RateLimitOptions {
  route: string;
  limit: number; // max requests
  windowMs: number; // request window
  blockMs: number; // cooldown
}

export async function checkRateLimit(ip: string, options: RateLimitOptions) {
  const { route, limit, windowMs, blockMs } = options;
  const now = new Date();
  // await initializeConnection();
  // fetch recent attempts
  const attempts = await db
    .select()
    .from(rateLimits)
    .where(
      and(
        eq(rateLimits.ipAddress, ip),
        eq(rateLimits.route, route),
        gte(
          rateLimits.createdAt,
          new Date(now.getTime() - Math.max(windowMs, blockMs))
        )
      )
    )
    .orderBy(rateLimits.createdAt);

  // block check
  if (attempts && attempts.length >= limit) {
    const firstBlockedAt = attempts[attempts.length - limit]?.createdAt;
    if (firstBlockedAt && now.getTime() - firstBlockedAt.getTime() < blockMs) {
      return { success: false, message: "Too many requests. Try again later." };
    }
  }

  // insert new attempt
  await db.insert(rateLimits).values({
    ipAddress: ip,
    route,
  });

  return { success: true };
}
