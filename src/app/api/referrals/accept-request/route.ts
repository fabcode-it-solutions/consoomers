import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { eq, and } from "drizzle-orm";
import { testerReferrals } from "@/db/schema/tester";

type StatusType = NonNullable<(typeof testerReferrals.$inferSelect)["status"]>;

export async function POST(req: Request) {
  try {
    const { friendEmail, joinedUserId } = await req.json();

    if (!friendEmail || !joinedUserId) {
      return NextResponse.json(
        { error: "friendEmail and joinedUserId are required" },
        { status: 400 }
      );
    }

    const email = friendEmail.toLowerCase();

    // Find pending referral
    const referral = await db.query.testerReferrals.findFirst({
      where: and(
        eq(
          testerReferrals.friendEmail,
          email
        ),
        eq(
          testerReferrals.status,
          "pending" as StatusType
        )
      )
    });

    if (!referral) {
      return NextResponse.json(
        { error: "No pending referral found for this email" },
        { status: 404 }
      );
    }

    // Update referral to accepted
    const updated = await db
      .update(testerReferrals)
      .set({
        status: "accepted" as StatusType,
        joinedUserId,
      })
      .where(eq(testerReferrals.id, referral.id))
      .returning();

    return NextResponse.json(
      { message: "Referral accepted", referral: updated[0] },
      { status: 200 }
    );

  } catch (error) {
    console.error("REFERRAL ACCEPT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to accept referral" },
      { status: 500 }
    );
  }
}
