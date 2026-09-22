export const categoryService = {
  async getAllCategories(params: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    try {
      const response = await fetch(
        `/api/dashboard/categories?page=${params.page || 1}&limit=${params.limit || 10}&search=${params.search || ""}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load categories");
      }

      return data;
    } catch (error) {
      console.error("getAllCategories error:", error);
      throw error;
    }
  },

  async getCategoriesForDropdown() {
    try {
      const response = await fetch("/api/dashboard/categories?simple=true");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to load category list");
      }

      return { success: true, data: data.data };
    } catch (err) {
      console.error("getCategoriesForDropdown error:", err);
    
      return { success: false, data: [] };
    }
  },

  async createCategory(data: { name: string; description?: string }) {
    try {
      const response = await fetch("/api/dashboard/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.error || "Failed to create category");
      }

      return res;
    } catch (error) {
      console.error("createCategory error:", error);
      throw error;
    }
  },

  async updateCategory(
    id: string,
    data: { name: string; description?: string }
  ) {
    try {
      const response = await fetch(`/api/dashboard/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.error || "Failed to update category");
      }

      return res;
    } catch (error) {
      console.error("updateCategory error:", error);
      throw error;
    }
  },

  async deleteCategory(id: string) {
    try {
      const response = await fetch(`/api/dashboard/categories/${id}`, {
        method: "DELETE",
      });

      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.error || "Failed to delete category");
      }

      return res;
    } catch (error) {
      console.error("deleteCategory error:", error);
      throw error;
    }
  },
};