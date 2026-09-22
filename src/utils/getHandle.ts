import { db } from "@/db/db";
import { categories } from "@/db/schema/category";
import { like } from "drizzle-orm";

/**
 * Generates a unique handle for a category.
 * @param name - The category name.
 * @returns A unique handle string.
 */
export async function getHandle(name: string): Promise<string> {
  const baseHandle = name.trim().toLowerCase().replace(/\s+/g, "-");

  const existing = await db
    .select({ handle: categories.handle })
    .from(categories)
    .where(like(categories.handle, `${baseHandle}%`))
    .execute();
  if (existing.length === 0) return baseHandle;
  const suffixes = existing.map(({ handle }) => {
    const match = handle.match(new RegExp(`^${baseHandle}-(\\d+)$`));
    return match ? parseInt(match[1], 10) : 0;
  });

  const nextSuffix = Math.max(...suffixes) + 1;

  return `${baseHandle}-${nextSuffix}`;
}
