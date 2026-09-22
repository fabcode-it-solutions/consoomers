// app/api/auth/register/tester/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { sendEmail, sendOTPEmail } from "@/actions/mailer";
import { users } from "@/db/schema/users";
import {
  testerAgreements,
  testerProfiles,
  testerTiers,
} from "@/db/schema/tester";
import notificationApi from "@/services/notificationApi";

import { checkRateLimit } from "@/actions/rateLimiter";
import { withCSRFProtection } from "@/libs/csrf/csrfMiddleware";
export async function POST(req: NextRequest) {
  try {
    const csrf = await withCSRFProtection(req);
    if (csrf) return csrf;
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rateLimitResult = await checkRateLimit(ip, {
      route: "/api/auth/register/tester",
      limit: 10,
      windowMs: 5 * 60 * 1000,
      blockMs: 10 * 60 * 1000,
    });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { status: 429 }
      );
    }

    const body = await req.json();
    console.log("data yeh hai -->", body);
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      categoryInterested,
      mainInterest,
      specificIntrest,
      beautySkinTone,
      beautySkinType,
      hairColor,
      hairType,
      avgMonthlySpend,
      fitnessWellness,
      primaryFocus,
      foodBeverage,
      foodAllergies,
      kids,
      pets,
      hobbies,
      agreement,
      country,
      state,
      locationType,
      household,
      income,
      gender,
      ageGroup,
      over18,
      acceptedTerms,
      profileImage,
    } = body;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const profileImageId = profileImage?.id || null;

    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: userId,
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        emailVerified: false,
        role: "tester",
      });

      const [tester] = await tx
        .insert(testerProfiles)
        .values({
          id: uuidv4(),
          userId,
          firstName,
          lastName,
          email,
          categoryInterested,
          mainInterest,
          specificInterest: specificIntrest,
          beautySkinTone,
          beautySkinType,
          hairColor,
          hairType,
          avgMonthlySpend,
          fitnessWellness,
          primaryFocus,
          foodBeverage,
          foodAllergies,
          kids: Array.isArray(kids) ? kids : [],
          pets: Array.isArray(pets) ? pets : [],
          hobbies,
          generalAgreement: !!agreement,
          country,
          state: state ?? null,
          locationType,
          householdComposition: household,
          householdIncome: income,
          gender,
          ageGroup,
          over18: over18 ?? true,
          acceptedTerms: acceptedTerms ?? false,
          profileImage: profileImageId,
        })
        .returning({ id: testerProfiles.id });

      await tx.insert(testerTiers).values({
        id: uuidv4(),
        testerId: tester.id,
        testerTier: "explorer",
      });

      await tx.insert(testerAgreements).values({
        id: uuidv4(),
        testerId: tester.id,
        likesProgram: true,
        votesCampaign: true,
        surveyCampaign: true,
        tryTellCampaign: true,
        generalAgreement: true,
      });
    });

    try {
      await notificationApi.createNotification({
        type: "custom",
        title: "Welcome to Consoomers! 🎉",
        message: `Hi ${firstName}! Your tester account has been successfully created.`,
        recipientId: userId,
        icon: "🎉",
        link: "/dashboard",
        data: {
          welcomeMessage: true,
          accountType: "tester",
        },
      });

      console.log(`✅ Welcome notification sent to tester: ${userId}`);
    } catch (notifError) {
      console.error("Failed to send welcome notification:", notifError);
    }

    try {
      const admins = await db
        .select()
        .from(users)
        .where(eq(users.role, "admin"))
        .limit(5);

      if (admins.length > 0) {
        const adminNotifications = admins.map((admin) =>
          notificationApi.createNotification({
            type: "custom",
            title: "New Tester Registered",
            message: `${firstName} ${lastName} (${email}) just signed up as a tester.`,
            recipientId: admin.id,
            senderId: userId,
            senderName: `${firstName} ${lastName}`,
            icon: "👤",
            link: `/admin/users/${userId}`,
            data: {
              newUserId: userId,
              userRole: "tester",
              userEmail: email,
            },
          })
        );

        await Promise.all(adminNotifications);
        console.log(`✅ Admin notifications sent for new tester: ${userId}`);
      }
    } catch (adminNotifError) {
      console.error("Failed to send admin notification:", adminNotifError);
    }

    const adminEmail = process.env.ADMIN_EMAIL || "hello@consoomers.com";
    const subject = "New Tester Registration";
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Archivo, sans-serif;">
        <h2>New Tester Registration</h2>
        <p>A new tester has registered:</p>
        <ul>
          <li><strong>Name:</strong> ${firstName} ${lastName}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Username:</strong> ${`${firstName}${lastName}`.toLowerCase()}</li>
          <li><strong>Phone:</strong> N/A</li>
          <li><strong>Registration Date:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <p>View the user profile in your admin panel.</p>
      </div>
    `;

    try {
      await sendEmail({ to: adminEmail, subject, html });
      console.log(`✅ Email notification sent to admin`);
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await sendOTPEmail(email, otp);
    return NextResponse.json(
      { message: "Signup successful. Check your email for OTP.", userId },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // (PATCH does not need CSRF or rate-limit unless you want it)

    const body = await req.json();
    const { testerId, firstName, lastName, profileImage, ...fieldsToUpdate } =
      body;

    if (!testerId)
      return NextResponse.json(
        { error: "testerId is required" },
        { status: 400 }
      );

    const updatedFields = Object.fromEntries(
      Object.entries(fieldsToUpdate).filter(
        ([_, v]) => v !== undefined && v !== null
      )
    );

    const profileImageId = Array.isArray(profileImage)
      ? profileImage[0]?.id ?? null
      : profileImage?.id ?? null;

    const setFields: any = { ...updatedFields };
    if (profileImageId && profileImageId !== testerId) {
      setFields.profileImage = profileImageId;
    }

    const [updatedProfile] = await db
      .update(testerProfiles)
      .set(setFields)
      .where(eq(testerProfiles.id, testerId))
      .returning();

    if (!updatedProfile)
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );

    const userUpdateFields: Record<string, string> = {};
    if (firstName) userUpdateFields.firstName = firstName;
    if (lastName) userUpdateFields.lastName = lastName;

    if (Object.keys(userUpdateFields).length > 0) {
      await db
        .update(users)
        .set(userUpdateFields)
        .where(eq(users.id, updatedProfile.userId));
    }

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        profile: updatedProfile,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
