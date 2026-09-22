import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { sendOTPEmail } from "@/actions/mailer";
import { db } from "@/db/db";
import { users } from "@/db/schema/users";

function generateOTP(length = 6) {
  let otp = "";
  for (let i = 0; i < length; i++) otp += Math.floor(Math.random() * 10);
  return otp;
}

export async function POST(req: Request) {
  const { email } = await req.json();
  console.log(email, "email");
  if (!email)
    return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const otp = generateOTP(6);
  const expires = new Date(Date.now() + 5 * 60 * 1000);

  await db
    .update(users)
    .set({ verificationToken: otp, verificationExpires: expires })
    .where(eq(users.id, user.id));

  await sendOTPEmail(email, otp);

  return NextResponse.json(
    { success: true, message: "OTP sent successfully" },
    { status: 200 }
  );
}
