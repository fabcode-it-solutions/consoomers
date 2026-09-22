import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth/auth";
import { generateCSRFToken } from "@/actions/csrfProtection";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const cookieStore = cookies();
    let sessionId = (await cookieStore).get("csrf_session_id")?.value;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
    }
    const csrfToken = await generateCSRFToken({
      sessionId,
      userId: session?.user?.id,
      expiresInMinutes: 60,
    });
    const response = NextResponse.json(
      {
        csrfToken,
        expiresIn: 3600,
      },
      { status: 200 }
    );
    response.headers.set("x-csrf-token", csrfToken);
    response.cookies.set("csrf_session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Error generating CSRF token:", error);
    return NextResponse.json(
      { error: "Failed to generate CSRF token" },
      { status: 500 }
    );
  }
}
