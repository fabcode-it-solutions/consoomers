/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

import { findUserByEmail } from "@/models/user.model";
import { checkRateLimit } from "@/actions/rateLimiter";
import bcrypt from "bcryptjs";


const NODE_ENV = process.env.NODE_ENV;
export const POST = async (request: Request) => {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const result = await checkRateLimit(ip, {
      route: "/api/auth/sign-in",
      limit: 100,
      windowMs: 1 * 60 * 1000,
      blockMs: 10 * 60 * 1000,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 429 });
    }
    const payload = await request.json();
    const { email, password } = payload;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }
    const userExist = await findUserByEmail({ email });

    if (!userExist) {
      return NextResponse.json(
        {
          error:
            "We’re sorry — we couldn’t find an account linked to this email.​Please make sure you’re using the same email address you signed up with, or create an account.​",
        },
        { status: 409 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, userExist.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Password does not match" },
        { status: 401 }
      );
    }
    userExist.passwordHash = "";
 
    return NextResponse.json(
      { message: "Login successful. Welcome back!", userExist },
      { status: 200 }
    );
  } catch (error: any) {
    if (NODE_ENV == "development") {
      console.log(error);
    }
    return NextResponse.json(
      { message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
};
