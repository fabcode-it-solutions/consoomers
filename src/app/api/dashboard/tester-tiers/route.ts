/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/db";
import { TesterTier } from "@/db/schema/users";
import { testerTiers, testerStatus } from "@/db/schema/tester";

interface CreateTierBody {
  testerId: string;
  testerTier?: TesterTier;
  criteria?: string[] | Record<string, any>;
  score?: string;
}


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const testerId = searchParams.get("testerId");

    if (testerId) {
      const [tier] = await db
        .select()
        .from(testerTiers)
        .where(eq(testerTiers.testerId, testerId));
      
      return NextResponse.json(tier || null);
    }
    const tiers = await db.select().from(testerTiers);
    return NextResponse.json(tiers);
  } catch (error) {
    console.error("GET /tester-tiers error:", error);
    return NextResponse.json({ error: "Failed to fetch tiers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: CreateTierBody = await req.json();
    const { testerId, testerTier = "explorer", criteria = [], score = "0" } = body;

    if (!testerId) {
      return NextResponse.json({ error: "testerId is required" }, { status: 400 });
    }
    const allowedTiers: TesterTier[] = ["explorer", "insider", "trendsetter"];
    if (!allowedTiers.includes(testerTier)) {
      return NextResponse.json({ error: "Invalid testerTier value" }, { status: 400 });
    }
    const criteriaObj = Array.isArray(criteria) 
      ? criteria.reduce((acc, item, idx) => ({ ...acc, [`criterion_${idx + 1}`]: item }), {})
      : criteria;
    const [existingTier] = await db
      .select()
      .from(testerTiers)
      .where(eq(testerTiers.testerId, testerId));

    let tierRecord;

    if (existingTier) {
      [tierRecord] = await db
        .update(testerTiers)
        .set({ 
          testerTier, 
          criteria: criteriaObj, 
          score,
          createdAt: new Date()
        })
        .where(eq(testerTiers.testerId, testerId))
        .returning();

      console.log("✅ Updated existing tier:", tierRecord);
    } else {
      [tierRecord] = await db
        .insert(testerTiers)
        .values({
          testerId,
          testerTier,
          criteria: criteriaObj,
          score,
        })
        .returning();

      console.log("✅ Created new tier:", tierRecord);
    }

    const [existingStatus] = await db
      .select()
      .from(testerStatus)
      .where(eq(testerStatus.testerId, testerId));

    if (existingStatus) {
      await db
        .update(testerStatus)
        .set({ 
          tierId: tierRecord.id,
          updatedAt: new Date()
        })
        .where(eq(testerStatus.testerId, testerId));
    } else {
      await db.insert(testerStatus).values({
        testerId,
        tierId: tierRecord.id,
      });
    }

    return NextResponse.json({
      success: true,
      tier: tierRecord,
      message: existingTier ? "Tier updated successfully" : "Tier created successfully"
    });

  } catch (error) {
    console.error("POST /tester-tiers error:", error);
    return NextResponse.json({ error: "Failed to save tester tier" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { testerId } = body;

    if (!testerId) {
      return NextResponse.json({ error: "testerId is required" }, { status: 400 });
    }
    await db.delete(testerStatus).where(eq(testerStatus.testerId, testerId));
    await db.delete(testerTiers).where(eq(testerTiers.testerId, testerId));
    return NextResponse.json({ message: "Tester tier deleted successfully" });
  } catch (error) {
    console.error("DELETE /tester-tiers error:", error);
    return NextResponse.json({ error: "Failed to delete tester tier" }, { status: 500 });
  }
}