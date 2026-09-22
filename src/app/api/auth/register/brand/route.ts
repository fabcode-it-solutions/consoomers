// app/api/auth/register/brand/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db, initializeConnection } from "@/db/db";
import { users } from "@/db/schema/users";
import { brands } from "@/db/schema/brands";
import { checkRateLimit } from "@/actions/rateLimiter";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/actions/mailer";
import notificationApi from "@/services/notificationApi";

import { NextRequest } from "next/server";
import { withCSRFProtection } from "@/libs/csrf/csrfMiddleware";

export const getHandle = (name: string) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
};

const RegisterSchema = z.object({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string(),
  password: z.string().min(8),
  brand: z.string(),
  website: z.string(),
  category: z.string(),
  goals: z.array(z.string()).default([]),
  sellingInUS: z.string(),
  position: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const csrf = await withCSRFProtection(req);
    if (csrf) return csrf;
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rateLimitResult = await checkRateLimit(ip, {
      route: "/api/auth/register/brand",
      limit: 10,
      windowMs: 5 * 60 * 1000,
      blockMs: 10 * 60 * 1000,
    });
    if (!rateLimitResult.success)
      return NextResponse.json(
        { error: rateLimitResult.message },
        { status: 429 }
      );

    const body = await req.json();
    const validation = RegisterSchema.safeParse(body);
    if (!validation.success)
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      brand,
      website,
      category,
      goals,
      sellingInUS,
      position,
    } = validation.data;

    await initializeConnection();

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser)
      return NextResponse.json(
        { error: "Account already exists" },
        { status: 409 }
      );

    const passwordHash = await bcrypt.hash(password, 12);
    const [createUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        firstName,
        lastName,
        username: `${firstName}${lastName}`.toLowerCase(),
        phoneNumber,
        role: "brand",
        bio: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create brand
    let handle = getHandle(brand);
    const [existingBrand] = await db
      .select()
      .from(brands)
      .where(eq(brands.handle, handle))
      .limit(1);

    if (existingBrand) handle = `${handle}-${Math.floor(Math.random() * 1000)}`;

    const [userBrand] = await db
      .insert(brands)
      .values({
        name: brand,
        website,
        category,
        userId: createUser.id,
        position,
        goals: Array.isArray(goals) ? goals : [],
        sellingInUS,
        brandName: brand,
        handle,
        createdAt: new Date(),
      })
      .returning();

    /*
    |--------------------------------------------------------------------------
    | ⭐ SEND REAL-TIME NOTIFICATIONS (Same as Tester Signup)
    |--------------------------------------------------------------------------
    */

    // 1️⃣ SEND WELCOME NOTIFICATION TO BRAND
    try {
      await notificationApi.createNotification({
        type: "custom",
        title: "Welcome to Consoomers! 🎉",
        message: `Hi ${firstName}, your brand account request has been submitted for review.`,
        recipientId: createUser.id,
        icon: "🏷️",
        link: "/brand/dashboard",
        data: {
          brandId: userBrand.id,
          brandName: brand,
          accountType: "brand",
        },
      });

      console.log(
        `✅ Welcome notification sent to brand user: ${createUser.id}`
      );
    } catch (error) {
      console.error("❌ Failed to send brand welcome notification:", error);
    }

    // 2️⃣ SEND NOTIFICATION TO ADMIN
    try {
      const adminUsers = await db
        .select()
        .from(users)
        .where(eq(users.role, "admin"))
        .limit(5);

      if (adminUsers.length > 0) {
        const notifPromises = adminUsers.map((admin) =>
          notificationApi.createNotification({
            type: "custom",
            title: "New Brand Registration",
            message: `${firstName} ${lastName} (${email}) just signed up as a Brand.`,
            recipientId: admin.id,
            senderId: createUser.id,
            senderName: `${firstName} ${lastName}`,
            icon: "🏢",
            link: `/admin/brands/${userBrand.id}`,
            data: {
              brandId: userBrand.id,
              userId: createUser.id,
              userEmail: email,
            },
          })
        );

        await Promise.all(notifPromises);
        console.log(
          `✅ Admin notifications sent for new brand: ${userBrand.id}`
        );
      }
    } catch (error) {
      console.error("❌ Failed to send admin notifications:", error);
    }

    /*
    |--------------------------------------------------------------------------
    | EMAIL NOTIFICATION (Existing code)
    |--------------------------------------------------------------------------
    */

    const adminEmail = "hello@consoomers.com";
    const subject = "New Brand Registration Request";
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Archivo, sans-serif;">
        <h2>New Brand Request</h2>
        <p>User <strong>${firstName} ${lastName}</strong> (${email}) has registered a new brand:</p>
        <ul>
          <li>Brand Name: ${brand}</li>
          <li>Category: ${category}</li>
          <li>Website: ${website}</li>
          <li>Position: ${position}</li>
          <li>Selling in US: ${sellingInUS}</li>
        </ul>
        <p>Please review this request in your admin panel.</p>
      </div>
    `;

    await sendEmail({ to: adminEmail, subject, html });

    createUser.passwordHash = "";
    return NextResponse.json(
      {
        success: true,
        data: { user: createUser, brand: userBrand },
        message: "Brand account created. Pending admin approval.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Brand signup error:", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId in query" },
        { status: 400 }
      );
    }

    const [data] = await db
      .select({
        id: brands.id,
        brandName: brands.brandName,
        website: brands.website,
        category: brands.category,
        sellingInUS: brands.sellingInUS,
        goals: brands.goals,
        position: brands.position,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phoneNumber: users.phoneNumber,
      })
      .from(brands)
      .innerJoin(users, eq(users.id, brands.userId))
      .where(eq(brands.userId, userId))
      .limit(1);

    if (!data) {
      return NextResponse.json({ error: "No brand found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching brand info:", error);
    return NextResponse.json(
      { error: "Failed to fetch brand info" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      brandId,
      firstName,
      lastName,
      phoneNumber,
      brandName,
      website,
      category,
      position,
      sellingInUS,
      goals,
    } = body;

    if (!userId)
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    await initializeConnection();
    await db
      .update(users)
      .set({
        firstName,
        lastName,
        phoneNumber,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
    const updatedBrand = await db
      .update(brands)
      .set({
        brandName,
        website,
        category,
        position,
        sellingInUS,
        goals,
        updatedAt: new Date(),
      })
      .where(eq(brands.id, brandId))
      .returning();

    if (!updatedBrand || updatedBrand.length === 0)
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });

    return NextResponse.json({
      success: true,
      data: {
        user: { firstName, lastName, phoneNumber },
        brand: updatedBrand[0],
      },
      message: "Profile updated successfully",
    });
  } catch (error: any) {
    console.error("PUT /brand error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
