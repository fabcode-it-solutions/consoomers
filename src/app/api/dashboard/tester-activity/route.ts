// app/api/dashboard/tester-activity/route.ts
import { NextResponse } from "next/server";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { db } from "@/db/db";
import { testerActivity } from "@/db/schema/tester";
import { ActivityType } from "@/db/schema/users";

interface CreateActivityBody {
  testerId: string;
  activityType: ActivityType;
  productId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: Record<string, any>;
}

interface GetActivityQuery {
  testerId?: string;
  activityType?: ActivityType;
  startDate?: string;
  endDate?: string;
  limit?: number;
}


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const testerId = searchParams.get("testerId");
    const activityType = searchParams.get(
      "activityType"
    ) as ActivityType | null;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "50");
    const conditions = [];
    if (testerId) {
      conditions.push(eq(testerActivity.testerId, testerId));
    }
    if (activityType) {
      conditions.push(eq(testerActivity.activityType, activityType));
    }

    if (startDate) {
      conditions.push(gte(testerActivity.createdAt, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(testerActivity.createdAt, new Date(endDate)));
    }
    const activities = await db
      .select()
      .from(testerActivity)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(testerActivity.createdAt))
      .limit(limit);
    const stats = await db
      .select()
      .from(testerActivity)
      .where(testerId ? eq(testerActivity.testerId, testerId) : undefined);

    const activityCounts = stats.reduce((acc, activity) => {
      acc[activity.activityType] = (acc[activity.activityType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      activities,
      stats: activityCounts,
      total: activities.length,
    });
  } catch (error) {
    console.error("GET /tester-activity error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
export async function POST(req: Request) {
  try {
    const body: CreateActivityBody = await req.json();
    const { testerId, activityType, productId, details = {} } = body;
    if (!testerId) {
      return NextResponse.json(
        { error: "testerId is required" },
        { status: 400 }
      );
    }

    if (!activityType) {
      return NextResponse.json(
        { error: "activityType is required" },
        { status: 400 }
      );
    }
    const validTypes: ActivityType[] = [
      "like",
      "vote",
      "request_sample",
      "focus_group_invite",
      "focus_group_selected",
    ];

    if (!validTypes.includes(activityType)) {
      return NextResponse.json(
        { error: "Invalid activityType" },
        { status: 400 }
      );
    }
    const [activity] = await db
      .insert(testerActivity)
      .values({
        testerId,
        activityType,
        productId: productId || null,
        details,
      })
      .returning();

    console.log(" Activity logged:", activity);

    return NextResponse.json({
      success: true,
      activity,
      message: "Activity logged successfully",
    });
  } catch (error) {
    console.error("POST /tester-activity error:", error);
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    );
  }
}
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { activityId } = body;

    if (!activityId) {
      return NextResponse.json(
        { error: "activityId is required" },
        { status: 400 }
      );
    }
    await db.delete(testerActivity).where(eq(testerActivity.id, activityId));
    return NextResponse.json({
      success: true,
      message: "Activity deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /tester-activity error:", error);
    return NextResponse.json(
      { error: "Failed to delete activity" },
      { status: 500 }
    );
  }
}
