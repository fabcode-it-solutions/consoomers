import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth/auth";
import { db } from "@/db/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Try reading body
  let userIdToDeactivate: string | undefined;

  try {
    const body = await req.json();
    userIdToDeactivate = body?.userId; // admin target ID
  } catch {
     userIdToDeactivate = undefined;
  }

  // If admin passes target user, deactivate that user
  // Otherwise, deactivate logged-in user's own account
  const targetId = userIdToDeactivate || session.user.id;

  try {
    await db
      .update(users)
      .set({
        status: "deactivated",
        deletedAt: new Date(),
      })
      .where(eq(users.id, targetId));

    return NextResponse.json(
      {
        message:
          targetId === session.user.id
            ? "Your account has been deactivated."
            : "Account successfully deactivated.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Deactivation error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
