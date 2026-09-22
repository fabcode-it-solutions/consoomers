"use client";
import { useState, useEffect } from "react";
import { categoryService } from "@/services/categories.service";

export const useCategories = () => {
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string; description?: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const result = await categoryService.getCategoriesForDropdown();
        if (result?.success) {
          setCategories(result.data || []);
        } else {
          setError("Failed to load categories");
        }
      } catch (err) {
        console.error(err);
        setError("Error loading categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};