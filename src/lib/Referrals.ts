import { db } from "@/db/db";
import { testerReferrals } from "@/db/schema/tester";

import { eq, and } from "drizzle-orm";

export async function findPendingReferralByEmail(email: string) {
  return await db.query.testerReferrals.findFirst({
    where: and(
      eq(testerReferrals.friendEmail, email.toLowerCase()),
      eq(testerReferrals.status, "pending")
    ),
  });
}
