/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema/users";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, oldPassword, newPassword, confirmPassword } = body;

    if (!userId || !oldPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New passwords do not match" },
        { status: 400 }
      );
    }

    // Fetch the user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify old password
    const isValidOldPassword = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isValidOldPassword) {
      return NextResponse.json(
        { error: "Old password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db
      .update(users)
      .set({ passwordHash: hashedPassword })
      .where(eq(users.id, userId));

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
  } catch (err: any) {
    console.error("Change password error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
