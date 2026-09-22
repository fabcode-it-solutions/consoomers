/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { withCSRFProtection } from "@/libs/csrf/csrfMiddleware";

/**
 * Test API Route for CSRF Protection
 * 
 * This route is used for testing CSRF protection.
 * DELETE THIS FILE IN PRODUCTION or protect it with authentication.
 * 
 * Usage:
 * POST /api/test-csrf
 * Headers: X-CSRF-Token: <token>
 * Body: { "test": "data" }
 */

export async function POST(req: NextRequest) {

  const csrfCheck = await withCSRFProtection(req);
  if (csrfCheck) return csrfCheck;

  try {
    const body = await req.json();

    return NextResponse.json(
      {
        success: true,
        message: "CSRF protection is working correctly",
        receivedData: body,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

/**
 * GET request should work without CSRF token
 */
export async function GET() {
  return NextResponse.json({
    message: "GET requests don't require CSRF tokens",
    timestamp: new Date().toISOString(),
  });
}

/**
 * PUT request requires CSRF token
 */
export async function PUT(req: NextRequest) {
  const csrfCheck = await withCSRFProtection(req);
  if (csrfCheck) return csrfCheck;

  return NextResponse.json({
    success: true,
    message: "PUT request with CSRF protection succeeded",
  });
}

/**
 * DELETE request requires CSRF token
 */
export async function DELETE(req: NextRequest) {
  const csrfCheck = await withCSRFProtection(req);
  if (csrfCheck) return csrfCheck;

  return NextResponse.json({
    success: true,
    message: "DELETE request with CSRF protection succeeded",
  });
}