/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "@/db/db";
import { products, productOptions, productVariants } from "@/db/schema/products";
import { brands } from "@/db/schema/brands";
import { authOptions } from "@/libs/auth/auth";
import { eq, and, inArray, ne } from "drizzle-orm";

const optionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  values: z.array(z.string()).min(1),
  position: z.number().optional(),
});

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  sku: z.string().optional().nullable(),
  price: z.union([z.string(), z.number()]),
  compareAtPrice: z.union([z.string(), z.number()]).optional().nullable(),
  stockQuantity: z.number().int().optional().default(0),
  lowStockThreshold: z.number().int().optional().default(5),
  trackInventory: z.boolean().optional().default(true),
  options: z.object({}).catchall(z.string()).optional().default({}),
  image: z.string().optional().nullable(),
  weight: z.union([z.string(), z.number()]).optional().nullable(),
  dimensions: z
    .object({
      length: z.number(),
      width: z.number(),
      height: z.number(),
      unit: z.enum(["cm", "in"]),
    })
    .optional()
    .nullable(),
  isActive: z.boolean().optional().default(true),
  isDefault: z.boolean().optional().default(false),
});

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  media: z.array(z.string()).optional().nullable(),
  price: z.union([z.string(), z.number()]).optional(),
  brandLogo: z.any().optional().nullable(),
  handle: z.string().optional().nullable(),
  brandId: z.string().uuid().optional().nullable(),
  brandName: z.string().optional().nullable(),
});

const updatePayload = z.object({
  productId: z.string().uuid(),
  product: productSchema,
  options: z.array(optionSchema).optional().nullable(),
  variants: z.array(variantSchema).optional().nullable(),
});

/* ---------- Helpers ---------- */
const makeSlug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/-+/g, "-")
    .trim();

async function findOrCreateBrandForAdmin(
  sessionUserId: string,
  brandId?: string | null,
  brandName?: string | null
) {
  if (brandId) {
    const [b] = await db.select().from(brands).where(eq(brands.id, brandId)).limit(1);
    if (!b) throw new Error("Brand not found for provided brandId");
    return b;
  }

  if (brandName) {
    const [existing] = await db.select().from(brands).where(eq(brands.name, brandName)).limit(1);
    if (existing) return existing;

    const handleBase = makeSlug(brandName);
    let finalHandle = handleBase;

    while (true) {
      const [h] = await db.select().from(brands).where(eq(brands.handle, finalHandle)).limit(1);
      if (!h) break;
      finalHandle = `${handleBase}-${Date.now()}`;
    }

    const [created] = await db.insert(brands).values({
      name: brandName,
      handle: finalHandle,
      userId: sessionUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return created;
  }

  throw new Error("Admin must provide brandId or brandName");
}

/* ---------- Route ---------- */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updatePayload.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ 
        error: "Invalid input", 
        details: parsed.error.flatten() 
      }, { status: 400 });
    }

    const { productId, product: productInput, options: optionsInput = [], variants: variantsInput = [] } = parsed.data;

    const isAdmin = session.user.role === "admin" || (session.user as any).isAdmin === true;

    // Get existing product
    const [existingProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check permissions
    if (!isAdmin) {
      // User must own the brand
      const [userBrand] = await db
        .select()
        .from(brands)
        .where(eq(brands.userId, session.user.id as string))
        .limit(1);

      if (!userBrand || userBrand.id !== existingProduct.brandId) {
        return NextResponse.json({ 
          error: "You can only edit products from your own brand" 
        }, { status: 403 });
      }
    }

    // Determine target brand (admin can change brand)
    let targetBrand: any;
    if (isAdmin && (productInput.brandId || productInput.brandName)) {
      try {
        targetBrand = await findOrCreateBrandForAdmin(
          session.user.id as string,
          productInput.brandId,
          productInput.brandName
        );
      } catch (err: any) {
        return NextResponse.json({ error: err.message || "Brand error" }, { status: 400 });
      }
    } else {
      // Keep existing brand
      const [brand] = await db
        .select()
        .from(brands)
        .where(eq(brands.id, existingProduct.brandId))
        .limit(1);
      targetBrand = brand;
    }

    // Check for duplicate product name (excluding current product)
    const [dup] = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.brandId, targetBrand.id),
          eq(products.name, productInput.name),
          ne(products.id, productId)
        )
      )
      .limit(1);

    if (dup) {
      return NextResponse.json({ 
        error: "Product with this name already exists for this brand" 
      }, { status: 409 });
    }

    // Handle unique
    let handle = productInput.handle ?? makeSlug(productInput.name);
    if (handle !== existingProduct.handle) {
      const existingHandleRows = await db
        .select()
        .from(products)
        .where(and(eq(products.handle, handle), ne(products.id, productId)))
        .execute();
      if (existingHandleRows.length > 0) {
        handle = `${handle}-${Date.now()}`;
      }
    }

    // Validate SKUs uniqueness (excluding existing variants)
    const incomingSkus = (variantsInput ?? [])
      .map((v: any) => (v.sku ? String(v.sku).trim() : null))
      .filter(Boolean) as string[];

    if (new Set(incomingSkus).size !== incomingSkus.length) {
      return NextResponse.json({ error: "Duplicate SKUs in request variants" }, { status: 400 });
    }

    if (incomingSkus.length > 0) {
      // Get existing variant IDs for this product
      const existingVariantIds = (variantsInput ?? [])
        .map((v: any) => v.id)
        .filter(Boolean);

      // Check for SKU conflicts (excluding this product's existing variants)
      const existingSkus = await db
        .select()
        .from(productVariants)
        .where(
          and(
            inArray(productVariants.sku, incomingSkus),
            ne(productVariants.productId, productId)
          )
        )
        .execute();

      if (existingSkus.length > 0) {
        return NextResponse.json({ 
          error: `SKU "${existingSkus[0].sku}" already exists in another product` 
        }, { status: 409 });
      }
    }

    // Update product in transaction
    const result = await db.transaction(async (tx) => {
      // Update product
      const [updatedProduct] = await tx
        .update(products)
        .set({
          handle,
          brandId: targetBrand.id,
          name: productInput.name,
          description: productInput.description ?? null,
          category: productInput.category ?? null,
          price: productInput.price ? String(productInput.price) : existingProduct.price,
          tags: productInput.tags ?? [],
          media: productInput.media ?? [],
          brandLogo: productInput.brandLogo ?? existingProduct.brandLogo,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId))
        .returning();

      // Handle options
      await tx.delete(productOptions).where(eq(productOptions.productId, productId));
      
      const createdOptions: any[] = [];
      if (optionsInput && optionsInput.length > 0) {
        for (const opt of optionsInput) {
          const [insOpt] = await tx.insert(productOptions).values({
            productId: updatedProduct.id,
            name: opt.name,
            values: opt.values,
            position: opt.position ?? 0,
            createdAt: new Date(),
          }).returning();
          createdOptions.push(insOpt);
        }
      }

      // Handle variants
      await tx.delete(productVariants).where(eq(productVariants.productId, productId));

      // Ensure at least one default
      const anyDefault = (variantsInput ?? []).some((v: any) => v.isDefault === true);
      if (!anyDefault && variantsInput && variantsInput.length > 0) {
        variantsInput[0].isDefault = true;
      }

      const createdVariants: any[] = [];
      if (variantsInput && variantsInput.length > 0) {
        for (const v of variantsInput) {
          const insObj: any = {
            productId: updatedProduct.id,
            name: v.name,
            sku: v.sku ?? null,
            price: String(v.price),
            compareAtPrice: v.compareAtPrice ? String(v.compareAtPrice) : null,
            stockQuantity: v.stockQuantity ?? 0,
            lowStockThreshold: v.lowStockThreshold ?? 5,
            trackInventory: v.trackInventory ?? true,
            options: v.options ?? {},
            image: v.image ?? null,
            weight: v.weight ?? null,
            dimensions: v.dimensions ?? null,
            isActive: v.isActive ?? true,
            isDefault: v.isDefault ?? false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const [insVar] = await tx.insert(productVariants).values(insObj).returning();
          createdVariants.push(insVar);
        }
      }

      return { product: updatedProduct, options: createdOptions, variants: createdVariants };
    });

    return NextResponse.json({
      message: "Product updated successfully",
      product: result.product,
      options: result.options,
      variants: result.variants,
    }, { status: 200 });

  } catch (err: any) {
    console.error("update product error:", err);
    if (err?.issues) {
      return NextResponse.json({ 
        error: "Validation error", 
        details: err.issues 
      }, { status: 400 });
    }
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: err?.message ?? String(err) 
    }, { status: 500 });
  }
}