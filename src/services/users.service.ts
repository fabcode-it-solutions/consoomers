const env = process.env.NODE_ENV != "production";

export const userService = {
  getUser: async (value: string, key: "email" | "id") => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/user?${key}=${value}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const user = await response.json();
      return user;
    } catch (error) {
      if (env) {
        console.error(error);
      }
      return { error: "Something Went wrong" };
    }
  },


  getAllUsers: async ({page, limit, search, sortBy,sortOrder,role}: {page: number;limit: number;search?: string;sortBy?: string;sortOrder?: string; role?: string;}) => {
  try {
    const query = new URLSearchParams({
      page: page.toString(),
       role: role || "",
      limit: limit.toString(),
      ...(search ? { search } : {}),
      ...(sortBy ? { sortBy } : {}),
      ...(sortOrder ? { sortOrder } : {}),
    }).toString();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/dashboard/users?${query}`,
       {
          next: {
            tags: ["profile"],
          },
        }
    );
    const result = await res.json();
    return result;
  } catch (error) {
    console.log("Error fetching users:", error);
    return { message: "Error fetching users", statusCode: 500 };
  }
} , 
};
