/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/user/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { db } from "@/db/db";
import { authOptions } from "@/libs/auth/auth";

// GET - Fetch user settings
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch from database
    const settings = await (db as any).userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      // Return default settings if not found
      const defaultSettings = {
        userId,
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          marketingEmails: false,
          productUpdates: true,
        },
        privacy: {
          profileVisibility: "private",
          showEmail: false,
          allowDataCollection: true,
          showActivity: false,
        },
        dataRetention: {
          autoDeleteAfterDays: 90,
          keepBackups: true,
        },
      };

      return NextResponse.json({ settings: defaultSettings }, { status: 200 });
    }

    return NextResponse.json({ settings }, { status: 200 });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// POST - Update user settings
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, settings } = await req.json();

    // Verify user can only modify their own settings
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized - Cannot modify other user settings" },
        { status: 403 }
      );
    }

    // Validate settings structure
    if (
      !settings ||
      !settings.notifications ||
      !settings.privacy ||
      !settings.dataRetention
    ) {
      return NextResponse.json(
        { error: "Invalid settings structure" },
        { status: 400 }
      );
    }

    // Update settings in database
    const updatedSettings = await (db as any).userSettings.upsert({
      where: { userId },
      update: { ...settings, updatedAt: new Date() },
      create: { userId, ...settings },
    });

    return NextResponse.json(
      {
        success: true,
        settings: updatedSettings,
        message: "Settings updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}








