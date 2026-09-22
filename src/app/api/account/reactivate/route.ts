import { db } from "@/db/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const result = await db
      .update(users)
      .set({ status: "active" })
      .where(eq(users.email, email));

    return Response.json(
      { success: true, message: "Account reactivated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reactivation error:", error);

    return Response.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
