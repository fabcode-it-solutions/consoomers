/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { eq, and, inArray } from "drizzle-orm";  // Added inArray
import { db } from "@/db/db";
import { productOptions, products, productVariants } from "@/db/schema/products";
import { brands } from "@/db/schema/brands";
import { authOptions } from "@/libs/auth/auth";

const variantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  sku: z.string().optional(),
  price: z.string().or(z.number()),
  compareAtPrice: z.string().or(z.number()).optional().nullable(),
  stockQuantity: z.number().default(0),
  lowStockThreshold: z.number().default(5),
  trackInventory: z.boolean().default(true),
 options: z.object({}).catchall(z.string()).optional().default({}),
  image: z.string().optional().nullable(),
  weight: z.number().optional().nullable(),
  dimensions: z
    .object({
      length: z.number(),
      width: z.number(),
      height: z.number(),
      unit: z.enum(["cm", "in"]),
    })
    .optional()
    .nullable(),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

const createVariantsSchema = z.object({
  productId: z.string().uuid(),
  variants: z.array(variantSchema),
  options: z
    .array(
      z.object({
        name: z.string(),
        values: z.array(z.string()),
        position: z.number().optional(),
      })
    )
    .optional(),
});

const updateVariantSchema = z.object({
  variantId: z.string().uuid(),
  name: z.string().optional(),
  sku: z.string().optional(),
  price: z.string().or(z.number()).optional(),
  compareAtPrice: z.string().or(z.number()).optional().nullable(),
  stockQuantity: z.number().optional(),
  lowStockThreshold: z.number().optional(),
  trackInventory: z.boolean().optional(),
  options: z.object({}).catchall(z.string()).optional().default({}),
  image: z.string().optional().nullable(),
  weight: z.number().optional().nullable(),
  dimensions: z
    .object({
      length: z.number(),
      width: z.number(),
      height: z.number(),
      unit: z.enum(["cm", "in"]),
    })
    .optional()
    .nullable(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

async function checkUserAccess(
  userId: string,
  productId: string,
  isAdmin: boolean = false
): Promise<boolean> {
  if (isAdmin) return true;

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) return false;

  const [brand] = await db
    .select()
    .from(brands)
    .where(and(eq(brands.id, product.brandId), eq(brands.userId, userId)))
    .limit(1);

  return !!brand;
}

// POST - Create variants for a product
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createVariantsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { productId, variants, options } = parsed.data;

    // Verify product exists and user has access
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const isAdmin =
      session.user.role === "admin" || session.user.isAdmin === true;
    const hasAccess = await checkUserAccess(
      session.user.id as string,
      productId,
      isAdmin
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have permission to add variants to this product" },
        { status: 403 }
      );
    }

    // Validate that at least one variant is provided
    if (!variants || variants.length === 0) {
      return NextResponse.json(
        { error: "At least one variant is required" },
        { status: 400 }
      );
    }

    // Validate SKU uniqueness
    const skus = variants
      .filter((v) => v.sku)
      .map((v) => v.sku)
      .filter((sku): sku is string => sku != null);  // Ensure skus is string[]
    const uniqueSkus = new Set(skus);
    if (skus.length !== uniqueSkus.size) {
      return NextResponse.json(
        { error: "Duplicate SKUs found in variants" },
        { status: 400 }
      );
    }

    // Check if SKUs already exist in database
    if (skus.length > 0) {
      const existingSkus = await db
        .select()
        .from(productVariants)
        .where(inArray(productVariants.sku, skus))  // Changed to inArray to check all SKUs
        .execute();

      if (existingSkus.length > 0) {
        return NextResponse.json(
          { error: `SKU "${existingSkus[0].sku}" already exists` },
          { status: 409 }
        );
      }
    }

    // Create product options first if provided
    if (options && options.length > 0) {
      // Delete existing options for this product
      await db
        .delete(productOptions)
        .where(eq(productOptions.productId, productId));

      // Insert new options
      for (const option of options) {
        await db.insert(productOptions).values({
          productId,
          name: option.name,
          values: option.values,
          position: option.position || 0,
          createdAt: new Date(),
        });
      }
    }

    // Check if any variant is set as default
    const hasDefault = variants.some((v) => v.isDefault);

    // If setting a variant as default, unset existing defaults
    if (hasDefault) {
      await db
        .update(productVariants)
        .set({ isDefault: false })
        .where(eq(productVariants.productId, productId));
    }

    // If no default is set, make the first variant default
    if (!hasDefault && variants.length > 0) {
      variants[0].isDefault = true;
    }

    // Create variants
    const createdVariants = [];
    for (const variant of variants) {
      const [newVariant] = await db
        .insert(productVariants)
        .values({
          productId,
          name: variant.name,
          sku: variant.sku || null,
          price: variant.price.toString(),
          compareAtPrice: variant.compareAtPrice
            ? variant.compareAtPrice.toString()
            : null,
          stockQuantity: variant.stockQuantity,
          lowStockThreshold: variant.lowStockThreshold,
          trackInventory: variant.trackInventory,
          options: variant.options as Record<string, string>,  // Cast to match Drizzle expectation
          image: variant.image || null,
          weight: variant.weight ? variant.weight.toString() : null,  // Assumes DB column is string; remove toString() if number
          dimensions: variant.dimensions || null,
          isActive: variant.isActive,
          isDefault: variant.isDefault,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      createdVariants.push(newVariant);
    }

    return NextResponse.json(
      {
        message: "Variants created successfully",
        variants: createdVariants,
        count: createdVariants.length,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating variants:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

// GET - Fetch variants for a product
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const variantId = searchParams.get("variantId");

    // Get single variant by ID
    if (variantId) {
      const [variant] = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.id, variantId))
        .limit(1);

      if (!variant) {
        return NextResponse.json(
          { error: "Variant not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ variant });
    }

    // Get all variants for a product
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Verify product exists
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Fetch variants
    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, productId))
      .execute();

    // Fetch options
    const options = await db
      .select()
      .from(productOptions)
      .where(eq(productOptions.productId, productId))
      .execute();

    return NextResponse.json({
      variants,
      options,
      count: variants.length,
    });
  } catch (error: any) {
    console.error("Error fetching variants:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update a variant
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateVariantSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { variantId, ...updates } = parsed.data;

    // Get existing variant
    const [existingVariant] = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.id, variantId))
      .limit(1);

    if (!existingVariant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    // Check user access
    const isAdmin =
      session.user.role === "admin" || session.user.isAdmin === true;
    const hasAccess = await checkUserAccess(
      session.user.id as string,
      existingVariant.productId,
      isAdmin
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have permission to update this variant" },
        { status: 403 }
      );
    }

    // If updating SKU, check for uniqueness
    if (updates.sku && updates.sku !== existingVariant.sku) {
      const [existingSku] = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.sku, updates.sku))
        .limit(1);

      if (existingSku) {
        return NextResponse.json(
          { error: `SKU "${updates.sku}" already exists` },
          { status: 409 }
        );
      }
    }

    // If setting as default, unset other defaults
    if (updates.isDefault === true) {
      await db
        .update(productVariants)
        .set({ isDefault: false })
        .where(eq(productVariants.productId, existingVariant.productId));
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.sku !== undefined) updateData.sku = updates.sku;
    if (updates.price !== undefined)
      updateData.price = updates.price.toString();
    if (updates.compareAtPrice !== undefined)
      updateData.compareAtPrice = updates.compareAtPrice
        ? updates.compareAtPrice.toString()
        : null;
    if (updates.stockQuantity !== undefined)
      updateData.stockQuantity = updates.stockQuantity;
    if (updates.lowStockThreshold !== undefined)
      updateData.lowStockThreshold = updates.lowStockThreshold;
    if (updates.trackInventory !== undefined)
      updateData.trackInventory = updates.trackInventory;
    if (updates.options !== undefined) updateData.options = updates.options;
    if (updates.image !== undefined) updateData.image = updates.image;
    if (updates.weight !== undefined)
      updateData.weight = updates.weight ? updates.weight.toString() : null;
    if (updates.dimensions !== undefined)
      updateData.dimensions = updates.dimensions;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
    if (updates.isDefault !== undefined)
      updateData.isDefault = updates.isDefault;

    // Update variant
    const [updatedVariant] = await db
      .update(productVariants)
      .set(updateData)
      .where(eq(productVariants.id, variantId))
      .returning();

   
   

    return NextResponse.json({
      message: "Variant updated successfully",
      variant: updatedVariant,
    });
  } catch (error: any) {
    console.error("Error updating variant:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a variant
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const variantId = searchParams.get("variantId");

    if (!variantId) {
      return NextResponse.json(
        { error: "Variant ID is required" },
        { status: 400 }
      );
    }

    // Get existing variant
    const [existingVariant] = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.id, variantId))
      .limit(1);

    if (!existingVariant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    // Check user access
    const isAdmin =
      session.user.role === "admin" || session.user.isAdmin === true;
    const hasAccess = await checkUserAccess(
      session.user.id as string,
      existingVariant.productId,
      isAdmin
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have permission to delete this variant" },
        { status: 403 }
      );
    }

    // Check if this is the last variant
    const remainingVariants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, existingVariant.productId))
      .execute();

    if (remainingVariants.length === 1) {
      return NextResponse.json(
        { error: "Cannot delete the last variant. Products must have at least one variant." },
        { status: 400 }
      );
    }

    // If deleting default variant, set another as default
    if (existingVariant.isDefault && remainingVariants.length > 1) {
      const newDefault = remainingVariants.find((v) => v.id !== variantId);
      if (newDefault) {
        await db
          .update(productVariants)
          .set({ isDefault: true })
          .where(eq(productVariants.id, newDefault.id));
      }
    }

    // Delete variant
    await db.delete(productVariants).where(eq(productVariants.id, variantId));

    return NextResponse.json({
      message: "Variant deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting variant:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}