// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/db/db";
// import { products } from "@/db/schema/products";
// import { brands } from "@/db/schema/brands";
// import { ilike, or, eq } from "drizzle-orm";

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const query = searchParams.get("q");

//     if (!query || query.trim().length === 0) {
//       return NextResponse.json({ products: [] });
//     }

//     const searchTerm = `%${query.trim()}%`;
    
//     const searchResults = await db
//       .select({
//         id: products.id,
//         name: products.name,
//         description: products.description,
//         category: products.category,
//         tags: products.tags,
//         media: products.media,
//         handle: products.handle,
//         brandLogo: products.brandLogo,
//         price: products.price,
//         createdAt: products.createdAt,
//         updatedAt: products.updatedAt,
//         productNum: products.productNum,
//         productId: products.productId,
//         brandId: products.brandId,
//         brandUserId: brands.userId
//       })
//       .from(products)
//       .leftJoin(brands, eq(products.brandId, brands.id))
//       .where(
//         or(
//           ilike(products.name, searchTerm),
//           ilike(products.category, searchTerm),
//           // ilike(products.description, searchTerm),
//           ilike(brands.name, searchTerm)
//         )
//       )
//       .limit(50);

//     return NextResponse.json({ products: searchResults });
//   } catch (error) {
//     console.error("Search API error:", error);
//     return NextResponse.json(
//       { error: "Failed to search products" },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { products } from "@/db/schema/products";
import { brands } from "@/db/schema/brands";
import { users } from "@/db/schema/users";
import { ilike, or, eq, asc, desc, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort"); // 👈 new: sort param (asc / desc)

    // Handle category-only filtering
    if (category && !query) {
      const categoryTerm = category.replace(/-/g, " ");
      const baseQuery = db
        .select({
          id: products.id,
          name: products.name,
          description: products.description,
          category: products.category,
          tags: products.tags,
          media: products.media,
          handle: products.handle,
          brandLogo: products.brandLogo,
          price: products.price,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          productNum: products.productNum,
          productId: products.productId,
          brandId: products.brandId,
          brandUserId: brands.userId,
        })
        .from(products)
        .leftJoin(brands, eq(products.brandId, brands.id))
        .leftJoin(users, eq(brands.userId, users.id))
        .where(and(
          ilike(products.category, `%${categoryTerm}%`),
          eq(users.status, "active")
        ));

      const searchResults =
        sort === "asc"
          ? await baseQuery.orderBy(asc(products.price)).limit(50)
          : sort === "desc"
          ? await baseQuery.orderBy(desc(products.price)).limit(50)
          : await baseQuery.limit(50);

      return NextResponse.json({ products: searchResults });
    }

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ products: [] });
    }

    const searchTerm = `%${query.trim()}%`;

    const baseQuery = db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        category: products.category,
        tags: products.tags,
        media: products.media,
        handle: products.handle,
        brandLogo: products.brandLogo,
        price: products.price,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        productNum: products.productNum,
        productId: products.productId,
        brandId: products.brandId,
        brandUserId: brands.userId,
      })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(users, eq(brands.userId, users.id))
      .where(
        and(
          or(
            ilike(products.name, searchTerm),
            ilike(products.category, searchTerm),
            ilike(products.description, searchTerm),
            ilike(brands.name, searchTerm)
          ),
          eq(users.status, "active")
        )
      );

    // 👇 only add sorting if provided
    const searchResults =
      sort === "asc"
        ? await baseQuery.orderBy(asc(products.price)).limit(50)
        : sort === "desc"
        ? await baseQuery.orderBy(desc(products.price)).limit(50)
        : await baseQuery.limit(50);

    return NextResponse.json({ products: searchResults });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  }
}
