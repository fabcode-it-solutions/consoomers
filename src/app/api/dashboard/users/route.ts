/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { users } from "@/db/schema/users";
import { brands } from "@/db/schema/brands";
import { testerProfiles } from "@/db/schema/tester";
import { eq, sql, desc, asc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;
    const role = searchParams.get("role");
    const search = searchParams.get("search")?.trim() || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? asc : desc;

    const sortableColumns: Record<string, any> = {
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    };
    const sortColumn = sortableColumns[sortBy] ?? users.createdAt;

    const baseQuery = db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(() => {
        const conditions: any[] = [];

        if (role) {
          conditions.push(eq(users.role, role as any));
        }

        if (search && role === "brand") {
          conditions.push(
            sql`(${users.email} ILIKE ${"%" + search + "%"} 
              OR ${users.firstName} ILIKE ${"%" + search + "%"} 
              OR ${users.lastName} ILIKE ${"%" + search + "%"}
              OR EXISTS (
                SELECT 1 FROM ${brands} 
                WHERE ${brands.userId} = ${users.id} 
                AND ${brands.brandName} ILIKE ${"%" + search + "%"}
              ))`
          );
        } else if (search) {
          conditions.push(
            sql`(${users.email} ILIKE ${"%" + search + "%"} 
              OR ${users.firstName} ILIKE ${"%" + search + "%"} 
              OR ${users.lastName} ILIKE ${"%" + search + "%"})`
          );
        }
        return conditions.length > 0 ? sql.join(conditions, sql` AND `) : undefined;
      })
      .orderBy(sortOrder(sortColumn))
      .limit(limit)
      .offset(offset);

    const allUsers = await baseQuery;
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(() => {
        const conditions: any[] = [];

        if (role) conditions.push(eq(users.role, role as any));

        if (search && role === "brand") {
          conditions.push(
            sql`(${users.email} ILIKE ${"%" + search + "%"} 
              OR ${users.firstName} ILIKE ${"%" + search + "%"} 
              OR ${users.lastName} ILIKE ${"%" + search + "%"}
              OR EXISTS (
                SELECT 1 FROM ${brands} 
                WHERE ${brands.userId} = ${users.id} 
                AND ${brands.brandName} ILIKE ${"%" + search + "%"}
              ))`
          );
        } else if (search) {
          conditions.push(
            sql`(${users.email} ILIKE ${"%" + search + "%"} 
              OR ${users.firstName} ILIKE ${"%" + search + "%"} 
              OR ${users.lastName} ILIKE ${"%" + search + "%"})`
          );
        }

        return conditions.length > 0 ? sql.join(conditions, sql` AND `) : undefined;
      });

    const totalUsersResult = await countQuery;
    const totalUsers = Number(totalUsersResult[0].count);
    const totalPages = Math.ceil(totalUsers / limit);

 
    const enrichedUsers = await Promise.all(
      allUsers.map(async (user) => {
        if (user.role === "brand") {
          const [brand] = await db
            .select({
              brandName: brands.brandName,
              website: brands.website,
              category: brands.category,
              accessPassword: brands.accessPassword,
            })
            .from(brands)
            .where(eq(brands.userId, user.id))
            .limit(1);
          return { ...user, brand };
        }

        if (user.role === "tester") {
          const [tester] = await db
            .select({
              mainInterest: testerProfiles.mainInterest,
              categoryInterested: testerProfiles.categoryInterested,
              country: testerProfiles.country,
            })
            .from(testerProfiles)
            .where(eq(testerProfiles.userId, user.id))
            .limit(1);
          return { ...user, tester };
        }

        return user;
      })
    );
    return NextResponse.json({
      success: true,
      usersData: enrichedUsers,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: totalUsers,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      sort: {
        sortBy,
        sortOrder: sortOrder === asc ? "asc" : "desc",
      },
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
