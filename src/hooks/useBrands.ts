"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { brandsService, Brand, CreateBrandData } from "@/services/brands";

export const useBrands = () => {
  const { data: session } = useSession();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await brandsService.getBrands(session.user.id);
      
      if (response.success) {
        setBrands(response.data);
      } else {
        setError("Failed to fetch brands");
      }
    } catch (err) {
      setError("Error fetching brands");
      console.error("Error fetching brands:", err);
    } finally {
      setLoading(false);
    }
  };

  const createBrand = async (brandData: CreateBrandData) => {
    if (!session?.user?.id) throw new Error("User not authenticated");
    
    try {
      const response = await brandsService.createBrand(session.user.id, brandData);
      
      if (response.success) {
        setBrands(prev => [...prev, response.data]);
        return response.data;
      } else {
        throw new Error("Failed to create brand");
      }
    } catch (err) {
      console.error("Error creating brand:", err);
      throw err;
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchBrands();
    }
  }, [session?.user?.id]);

  return {
    brands,
    loading,
    error,
    fetchBrands,
    createBrand,
  };
};