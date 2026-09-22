/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db/db";
import { users } from "@/db/schema/users";
import { brands, brandCreate, brandRequests } from "@/db/schema/brands";
const reqSchema = z.object({
  userId: z.string().uuid(),
  brandName: z.string().min(2, "Brand name is required"),
  countryFounded: z.string().optional().nullable(),
  currentOwnership: z.string().optional().nullable(),
  brandMedia: z.array(z.any()).optional(),
  logo: z.string().uuid().optional().nullable(),
  products: z.array(z.any()).optional(),
  productsCsv: z.string().optional().nullable(),
  sweepstake: z.string().optional(),
  sendCopy: z.boolean().optional(),
});



export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = reqSchema.parse(body);
    const submittedName = data.brandName.trim();
    const [userWithBrand] = await db
      .select({
        userId: users.id,
        brandId: brands.id,
        brandName: brands.brandName,
      })
      .from(users)
      .leftJoin(brands, eq(users.id, brands.userId))
      .where(eq(users.id, data.userId));

    if (!userWithBrand) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

 
    const [existingBrandCreate] = await db
      .select()
      .from(brandCreate)
      .where(eq(brandCreate.userId, data.userId));

    if (existingBrandCreate) {
      return NextResponse.json(
        {
          error:
            "You have already created a brand. Only one brand is allowed per user.",
        },
        { status: 400 }
      );
    }

    const inserted = await db.transaction(async (tx) => {
      const [newBrandCreate] = await tx
        .insert(brandCreate)
        .values({
          userId: data.userId,
          brandId: userWithBrand.brandId ?? null,
          brandName: submittedName,
          countryFounded: data.countryFounded ?? undefined,
          currentOwnership: data.currentOwnership ?? undefined,
          brandMedia: data.brandMedia ?? [],
          logo: data.logo ?? null,
          products: data.products ?? [],
          productsCsv: data.productsCsv ?? [],
        } as any)
        .returning();

      const existingName = userWithBrand.brandName?.trim() ?? "";
      if (userWithBrand.brandId && submittedName !== existingName) {
        await tx
          .update(brands)
          .set({ brandName: submittedName })
          .where(eq(brands.id, userWithBrand.brandId));
      }

      await tx.insert(brandRequests).values({
        brandId: newBrandCreate.id,
        userId: data.userId,
        status: "pending",
        notes: `New brand "${submittedName}" created by user ${data.userId}`,
        statusRecord: JSON.stringify([
          {
            status: "pending",
            timestamp: new Date().toISOString(),
            message: "New brand awaiting admin approval.",
          },
        ]),
      });

      return newBrandCreate;
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Brand created successfully and sent for admin approval.",
        brand: inserted,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Create Brand Error:", err);
    if (err?.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: err.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const data = reqSchema.parse(body);
    const submittedName = data.brandName.trim();
    const [userWithBrand] = await db
      .select({
        userId: users.id,
        brandId: brands.id,
        brandName: brands.brandName,
      })
      .from(users)
      .leftJoin(brands, eq(users.id, brands.userId))
      .where(eq(users.id, data.userId));

    if (!userWithBrand) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    const [existingBrandCreate] = await db
      .select()
      .from(brandCreate)
      .where(eq(brandCreate.userId, data.userId));

    if (!existingBrandCreate) {
      return NextResponse.json(
        { error: "No brand creation record found for this user." },
        { status: 404 }
      );
    }

    const updated = await db.transaction(async (tx) => { 
      const [updatedBrandCreate] = await tx
        .update(brandCreate)
        .set({
          brandName: submittedName,
          countryFounded: data.countryFounded ?? undefined,
          currentOwnership: data.currentOwnership ?? undefined,
          brandMedia: data.brandMedia ?? [],
          logo: data.logo ?? null,
          products: data.products ?? [],
          productsCsv: data.productsCsv ?? [],
        })
        .where(eq(brandCreate.userId, data.userId))
        .returning();

      const existingName = userWithBrand.brandName?.trim() ?? "";
      if (userWithBrand.brandId && submittedName !== existingName) {
        await tx
          .update(brands)
          .set({ brandName: submittedName })
          .where(eq(brands.id, userWithBrand.brandId));
      }

      return updatedBrandCreate;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Brand form updated successfully",
        brand: updated,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Update Brand Error:", err);
    if (err?.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: err.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}