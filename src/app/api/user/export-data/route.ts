/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/db/db";
import { authOptions } from "@/libs/auth/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = req.nextUrl.searchParams.get("userId");

    if (!session?.user?.id || userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all user data
    const userData = await (db as any).user.findUnique({
      where: { id: userId },
      include: {
        testerProfile: true,
        brandProfile: true,
        settings: true,
        // Include other related data as needed
      },
    });

    if (!userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Sanitize sensitive data
    const exportData = {
      user: {
        id: userData.id,
        email: userData.email,
        createdAt: userData.createdAt,
      },
      profile: userData.testerProfile || userData.brandProfile,
      settings: userData.settings,
      // Add other non-sensitive data
    };

    // Create JSON blob
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });

    return new NextResponse(blob, {
      headers: {
        "Content-Disposition": `attachment; filename="user-data-${new Date().toISOString()}.json"`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}