"use server";
import { db, initializeConnection } from "@/db/db";
import { users } from "@/db/schema/users";
import { rateLimits } from "@/db/schema/rateLimits";
import { eq } from "drizzle-orm";

export async function findUserByEmail(email: string) {
  await initializeConnection();
  const [exist] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .orderBy(rateLimits.createdAt)
    .limit(1);
  if (exist) {
    return { success: true, message: "User already exists", user: exist };
  }
  return { success: false };
}
