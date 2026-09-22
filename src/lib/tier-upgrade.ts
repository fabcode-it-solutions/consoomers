// lib/tier-upgrade.ts
import { fetchActivities, calculateTotalScore, getTierFromScore } from "./activity-logger";
import { TesterTier } from "@/db/schema/users";

interface TierUpgradeResult {
  upgraded: boolean;
  oldTier: TesterTier;
  newTier: TesterTier;
  score: number;
  message: string;
}

/**
 * Check if tester is eligible for tier upgrade based on activity score
 */
export async function checkAndUpgradeTier(
  testerId: string,
  currentTier: TesterTier
): Promise<TierUpgradeResult> {
  try {
    // 1. Fetch all activities for this tester
    const { activities } = await fetchActivities({ testerId });

    // 2. Calculate total score
    const score = calculateTotalScore(activities);

    // 3. Determine eligible tier
    const eligibleTier = getTierFromScore(score);

    // 4. Check if upgrade is needed
    const tierOrder: TesterTier[] = ["explorer", "trendsetter", "insider"];
    const currentIndex = tierOrder.indexOf(currentTier);
    const eligibleIndex = tierOrder.indexOf(eligibleTier);

    if (eligibleIndex > currentIndex) {
      // Upgrade needed!
      await upgradeTester(testerId, eligibleTier, score);

      return {
        upgraded: true,
        oldTier: currentTier,
        newTier: eligibleTier,
        score,
        message: `Congratulations! You've been upgraded to ${eligibleTier.toUpperCase()}!`,
      };
    }

    return {
      upgraded: false,
      oldTier: currentTier,
      newTier: currentTier,
      score,
      message: `Current tier: ${currentTier}. Keep earning points to reach the next tier!`,
    };
  } catch (error) {
    console.error("Tier upgrade check failed:", error);
    throw error;
  }
}

/**
 * Upgrade tester tier
 */
async function upgradeTester(
  testerId: string,
  newTier: TesterTier,
  score: number
): Promise<void> {
  try {
    // 1. Update tier in database
    const response = await fetch("/api/dashboard/tester-tiers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testerId,
        testerTier: newTier,
        score: score.toString(),
        criteria: [], // Auto-upgraded based on score
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update tier");
    }

    // 2. Log tier upgrade activity
    await fetch("/api/dashboard/tester-activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testerId,
        activityType: "tier_upgraded",
        details: {
          newTier,
          score,
          upgradedAt: new Date().toISOString(),
        },
      }),
    });

    console.log(`✅ Tester ${testerId} upgraded to ${newTier}`);
  } catch (error) {
    console.error("Tier upgrade failed:", error);
    throw error;
  }
}

/**
 * Get tier progress information
 */
export function getTierProgress(score: number): {
  currentTier: TesterTier;
  nextTier: TesterTier | null;
  progress: number;
  pointsToNext: number;
} {
  const thresholds = {
    explorer: 0,
    trendsetter: 100,
    insider: 500,
  };

  const currentTier = getTierFromScore(score);

  if (currentTier === "insider") {
    return {
      currentTier,
      nextTier: null,
      progress: 100,
      pointsToNext: 0,
    };
  }

  if (currentTier === "trendsetter") {
    const progress = ((score - 100) / (500 - 100)) * 100;
    return {
      currentTier,
      nextTier: "insider",
      progress: Math.min(progress, 100),
      pointsToNext: Math.max(0, 500 - score),
    };
  }

  // Explorer
  const progress = (score / 100) * 100;
  return {
    currentTier,
    nextTier: "trendsetter",
    progress: Math.min(progress, 100),
    pointsToNext: Math.max(0, 100 - score),
  };
}

