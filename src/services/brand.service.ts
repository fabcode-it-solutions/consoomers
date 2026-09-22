/* eslint-disable @typescript-eslint/no-explicit-any */

export const BrandService = {
  getAllBrandRequests: async ({
    page,
    limit,
    status,
    userId,
    sortBy,
    sortOrder,
  }: {
    page: number;
    limit: number;
    status?: string;
    userId?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    try {
      // Build query string
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status ? { status } : {}),
        ...(userId ? { userId } : {}),
        ...(sortBy ? { sortBy } : {}),
        ...(sortOrder ? { sortOrder } : {}),
      }).toString();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/auth/register/brand/brand-request?${query}`,
        { next: { tags: ["brand-requests"] } }
      );

      const result = await res.json();

      // Ensure brandId is included
      if (result?.success && Array.isArray(result.data)) {
        // Each item should already include brandId from backend
        return result;
      }

      return result;
    } catch (error) {
      console.error("Error fetching brand requests:", error);
      return { message: "Error fetching brand requests", statusCode: 500 };
    }
  },

  createBrandRequest: async ({
    brandId,
    userId,
    status,
    notes,
    statusRecord,
  }: {
    brandId: string;
    userId: string;
    status?: string;
    notes?: any;
    statusRecord?: any;
  }) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/auth/register/brand/brand-request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brandId,
            userId,
            status,
            notes,
            statusRecord,
          }),
        }
      );

      const result = await res.json();
      console.log(result, "createBrandRequest result");
      return result;
    } catch (error) {
      console.error("Error creating brand request:", error);
      return { message: "Error creating brand request", statusCode: 500 };
    }
  },

  updateBrandRequest: async ({
    id,
    status,
    userId,
    notes,
    statusRecord,
  }: {
    id: string;
    status?: string;
    userId?: string;
    notes?: any;
    statusRecord?: any;
  }) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/auth/register/brand/brand-request/brand-requests`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            status,
            userId,
            notes,
            statusRecord,
          }),
        }
      );

      const result = await res.json();
      return result;
    } catch (error) {
      console.error("Error updating brand request:", error);
      return { message: "Error updating brand request", statusCode: 500 };
    }
  },

  deleteBrandRequest: async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/auth/register/brand/brand-request/brand-requests`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }
      );

      const result = await res.json();
      return result;
    } catch (error) {
      console.error("Error deleting brand request:", error);
      return { message: "Error deleting brand request", statusCode: 500 };
    }
  },

   getAllBrands: async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/dashboard/brand`);
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching brands:", error);
      return { message: "Error fetching brands", statusCode: 500 };
    }
  },
};
