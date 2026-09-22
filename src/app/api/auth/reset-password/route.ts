/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { findUserByEmail, updateUser } from "@/models/user.model";
import z from "zod";
import { checkRateLimit } from "@/actions/rateLimiter";
import bcrypt from "bcryptjs";
const Schema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});
export const POST = async (request: Request) => {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const result = await checkRateLimit(ip, {
      route: "/api/auth/reset-password",
      limit: 10,
      windowMs: 5 * 60 * 1000,
      blockMs: 10 * 60 * 1000,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 429 });
    }
    const payload = await request.json();
    const { email, password, auth } = payload;
    if (!auth) {
      return NextResponse.json(
        {
          error: "You are not authorized to access this route.",
        },
        { status: 400 }
      );
    }
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const validation = Schema.safeParse({ password });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed ",
          details: z.treeifyError(validation.error),
        },
        { status: 400 }
      );
    }
    const checkAuth = await findUserByEmail({ passwordToken: auth });
    if (!checkAuth) {
      return NextResponse.json(
        {
          error: "You are not authorized.",
        },
        { status: 409 }
      );
    }
    const userExist = await findUserByEmail({ email });
    if (!userExist) {
      return NextResponse.json(
        {
          error:
            "We’re sorry — we couldn’t find an account linked to this email.​ Please make sure you’re using the same email address you signed up with, or create an account.​",
        },
        { status: 409 }
      );
    }
    if (userExist.email != checkAuth.email) {
      return NextResponse.json(
        {
          error: "You are not authorized.",
        },
        { status: 409 }
      );
    }
   const hashedPassword = await bcrypt.hash(password, 10);
   console.log( hashedPassword ," hashedPassword ")
await updateUser(
  { id: userExist.id },
  { passwordHash: hashedPassword, emailVerified: true }
);


    return NextResponse.json(
      {
        message: "Password successfully reset. Please login to continue.",
        status: 200,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
};
