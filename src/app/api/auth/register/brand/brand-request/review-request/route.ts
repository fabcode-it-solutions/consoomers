/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { brandRequests } from "@/db/schema/brands";

export async function POST(req: Request) {
  try {
    const { brandId, userId, status, notes } = await req.json();

    if (!brandId || !userId || !status) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    const [brandRequest] = await db
      .select()
      .from(brandRequests)
      .where(eq(brandRequests.brandId, brandId))
      .limit(1);

    if (!brandRequest) {
      return NextResponse.json(
        { success: false, message: "Brand request not found" },
        { status: 404 }
      );
    }
    const existingStatusRecord = Array.isArray(brandRequest.statusRecord)
      ? brandRequest.statusRecord
      : [];

    const newRecord = {
      status,
      timestamp: new Date().toISOString(),
      message:
        status === "approved"
          ? "Brand approved successfully."
          : status === "rejected"
          ? "Brand rejected by admin."
          : status === "reviewed"
          ? "Brand reviewed and waiting for approval."
          : "Status updated.",
    };

    const updatedStatusRecord = [...existingStatusRecord, newRecord];

   
    await db
      .update(brandRequests)
      .set({
        status,
        notes,
        updatedAt: new Date(),
        statusRecord: updatedStatusRecord, 
      })
      .where(eq(brandRequests.brandId, brandId));

    return NextResponse.json({
      success: true,
      message: "Brand status updated successfully",
      data: {
        brandId,
        status,
        notes,
        statusRecord: updatedStatusRecord,
      },
    });
  } catch (error: any) {
    console.error("Review request error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
