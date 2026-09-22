import { db } from "@/db/db";
import { testerProfiles, testerTiers } from "@/db/schema/tester";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema/users";
import { media } from "@/db/schema/media";

export async function GET(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const userId = pathname.split("/").pop();

    if (!userId) {
      return NextResponse.json(
        { message: "User id required" },
        { status: 404 }
      );
    }

    const [profile] = await db
      .select({
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        emailVerified: users.emailVerified,

        // Media fields
        profileImageId: media.id,
        profileImage: media.src,
        profileImageAlt: media.alt,
        profileImageType: media.type,
        profileImageFormat: media.format,
        profileImageKey: media.key,

        // Tester profile fields
        testerId: testerProfiles.id,
        userId: testerProfiles.userId,
        categoryInterested: testerProfiles.categoryInterested,
        mainInterest: testerProfiles.mainInterest,
        specificIntrest: testerProfiles.specificInterest,
        beautySkinTone: testerProfiles.beautySkinTone,
        beautySkinType: testerProfiles.beautySkinType,
        hairColor: testerProfiles.hairColor,
        hairType: testerProfiles.hairType,
        avgMonthlySpend: testerProfiles.avgMonthlySpend,
        fitnessWellness: testerProfiles.fitnessWellness,
        primaryFocus: testerProfiles.primaryFocus,
        foodBeverage: testerProfiles.foodBeverage,
        foodAllergies: testerProfiles.foodAllergies,
        kids: testerProfiles.kids,
        pets: testerProfiles.pets,
        hobbies: testerProfiles.hobbies,
        generalAgreement: testerProfiles.generalAgreement,
        country: testerProfiles.country,
        state: testerProfiles.state,
        locationType: testerProfiles.locationType,
        householdComposition: testerProfiles.householdComposition,
        householdIncome: testerProfiles.householdIncome,
        gender: testerProfiles.gender,
        ageGroup: testerProfiles.ageGroup,
        over18: testerProfiles.over18,
        acceptedTerms: testerProfiles.acceptedTerms,
        createdAt: testerProfiles.createdAt,
        aboutYou: testerProfiles.aboutYou,
        id: testerProfiles.id,

        // Tier
        testerTier: testerTiers.testerTier,
      })
      .from(testerProfiles)
      .innerJoin(users, eq(testerProfiles.userId, users.id))
      .leftJoin(media, eq(testerProfiles.profileImage, media.id))
      .leftJoin(testerTiers, eq(testerProfiles.id, testerTiers.testerId))
      .where(eq(users.id, userId))
      .limit(1);

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error("Profile API Error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}