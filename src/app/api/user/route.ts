/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/db/db";
import { media } from "@/db/schema/media";
import { testerProfiles, testerTiers } from "@/db/schema/tester";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";
export const GET = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    const id = url.searchParams.get("id");
    if (!email && !id) {
      return NextResponse.json(
        { error: "Email or id is required." },
        { status: 400 }
      );
    }
    if (id) {
      const idValidate = uuidValidate(id);
      if (!idValidate) {
        return NextResponse.json({ error: "Id is not valid" }, { status: 400 });
      }
    }
    const condition = email ? eq(users.email, email) : eq(users.id, String(id));
    const user = await db.query.users.findFirst({
      where: condition,
      with: {
        testerProfile: true,
      },
    });
    // const [user] = await db
    //   .select()
    //   .from(users)
    //   .where(condition)
    //   .leftJoin(usersProfile, eq(usersProfile.userId, users.id))
    //   .leftJoin(testerProfiles, eq(testerProfiles.userId, users.id))
    //   .leftJoin(testerTiers, eq(testerProfiles.id, testerTiers.testerId))
    //   .limit(1);
    if (!user) {
      return NextResponse.json(
        { error: "User not found.", status: 404 },
        { status: 404 }
      );
    }

    let profileImageUrl = null;
    if (user.testerProfile?.profileImage) {
      const profileImageRecord = await db.query.media.findFirst({
        where: eq(media.id, user.testerProfile.profileImage),
      });
      profileImageUrl = profileImageRecord?.src || null;
    }
    const {
      passwordHash,
      resetPasswordToken,
      resetPasswordExpires,
      ...safeUser
    } = user;

    return NextResponse.json(
      {
        success: true,
        message: "User data fetched successfully.",
        user: {
          ...safeUser,
          profileImage: profileImageUrl,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("<---------- Get User Route Error ---------->");
    console.error(error);
    console.error("<---------- End Error ---------->");

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
};
