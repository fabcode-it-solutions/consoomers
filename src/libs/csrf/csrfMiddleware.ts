import { NextRequest, NextResponse } from "next/server";
import { validateCSRFToken } from "@/actions/csrfProtection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth/auth";

/**
 * HTTP methods that require CSRF protection
 */
const STATE_CHANGING_METHODS = ["POST", "PUT", "DELETE", "PATCH"];

/**
 * Routes that should be excluded from CSRF protection
 * (e.g., authentication routes)
 */
const EXCLUDED_ROUTES = [
  "/api/auth/",
  "/api/csrf-token",
  "/api/webhooks/",
];

/**
 * Check if a route should be excluded from CSRF protection
 */
function isExcludedRoute(pathname: string): boolean {
  return EXCLUDED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Verify CSRF token from request headers
 * @param request - The incoming request
 * @returns Validation result
 */
export async function verifyCSRFToken(
  request: NextRequest
): Promise<{ valid: boolean; message?: string }> {
  const method = request.method;
  const pathname = request.nextUrl.pathname;

  // Skip CSRF check for safe methods
  if (!STATE_CHANGING_METHODS.includes(method)) {
    return { valid: true };
  }

  // Skip CSRF check for excluded routes
  if (isExcludedRoute(pathname)) {
    return { valid: true };
  }

  // Get CSRF token from header
  const csrfToken = request.headers.get("x-csrf-token");

  if (!csrfToken) {
    return {
      valid: false,
      message: "CSRF token missing. Include X-CSRF-Token header.",
    };
  }

  // Get session information
  const session = await getServerSession(authOptions);
  const sessionId = request.cookies.get("csrf_session_id")?.value;

  // Validate token
  const validation = await validateCSRFToken(csrfToken, {
    sessionId,
    userId: session?.user?.id,
  });

  return validation;
}

/**
 * Middleware wrapper to protect API routes with CSRF
 * Usage in API route:
 * 
 * export async function POST(req: Request) {
 *   const csrfCheck = await withCSRFProtection(req);
 *   if (csrfCheck) return csrfCheck;
 *   
 *   // Your API logic here
 * }
 */
export async function withCSRFProtection(
  request: NextRequest
): Promise<NextResponse | null> {
  const validation = await verifyCSRFToken(request);

  if (!validation.valid) {
    return NextResponse.json(
      {
        error: "CSRF validation failed",
        message: validation.message,
      },
      { status: 403 }
    );
  }

  return null; // No error, continue with request
}

/**
 * Higher-order function to wrap API route handlers with CSRF protection
 * 
 * Usage:
 * export const POST = protectWithCSRF(async (req: Request) => {
 *   // Your API logic here
 * });
 */
export function protectWithCSRF(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const csrfCheck = await withCSRFProtection(req);
    if (csrfCheck) return csrfCheck;

    return handler(req);
  };
}