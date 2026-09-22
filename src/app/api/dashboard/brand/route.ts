import { NextRequest, NextResponse } from "next/server";
import { BrandService } from "@/services/brand.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const status = searchParams.get("status") || undefined;
    const userId = searchParams.get("userId") || undefined;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const result = await BrandService.getAllBrandRequests({
      page,
      limit,
      status,
      userId,
      sortBy,
      sortOrder,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error in API /brands:", error);
    return NextResponse.json(
      { message: "Failed to fetch brands", statusCode: 500 },
      { status: 500 }
    );
  }
}
