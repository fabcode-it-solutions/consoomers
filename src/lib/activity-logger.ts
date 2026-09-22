/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActivityType } from "@/db/schema/users";
interface LogActivityParams {
  testerId: string;
  activityType: ActivityType;
  productId?: string;
  details?: Record<string, any>;
}
export async function logActivity({
  testerId,
  activityType,
  productId,
  details = {},
}: LogActivityParams): Promise<boolean> {
  try {
    const response = await fetch("/api/dashboard/tester-activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testerId,
        activityType,
        productId,
        details,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to log activity:", error);
      return false;
    }

    const result = await response.json();
    console.log("✅ Activity logged:", result);
    return true;
  } catch (error) {
    console.error("Error logging activity:", error);
    return false;
  }
}

export async function fetchActivities(params?: {
  testerId?: string;
  activityType?: ActivityType;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  try {
    const queryParams = new URLSearchParams();

    if (params?.testerId) queryParams.set("testerId", params.testerId);
    if (params?.activityType) queryParams.set("activityType", params.activityType);
    if (params?.startDate) queryParams.set("startDate", params.startDate);
    if (params?.endDate) queryParams.set("endDate", params.endDate);
    if (params?.limit) queryParams.set("limit", params.limit.toString());

    const response = await fetch(
      `/api/dashboard/tester-activity?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch activities");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching activities:", error);
    return { activities: [], stats: {}, total: 0 };
  }
}


export function calculateActivityScore(activityType: ActivityType): number {
  const scoreMap: Record<ActivityType, number> = {
   like: 10,
    vote: 5,
    request_sample: 20,
    focus_group_invite: 20,
    focus_group_selected: 30,
  };

  return scoreMap[activityType] || 0;
}

export function calculateTotalScore(activities: any[]): number {
  return activities.reduce((total, activity) => {
    return total + calculateActivityScore(activity.activityType);
  }, 0);
}
export function getTierFromScore(score: number): "explorer" | "trendsetter" | "insider" {
  if (score >= 500) return "insider";
  if (score >= 100) return "trendsetter";
  return "explorer";
}

