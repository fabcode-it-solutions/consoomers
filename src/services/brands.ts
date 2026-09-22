export interface Brand {
  id: string;
  userId: string;
  name: string;
  website?: string;
  industry?: string;
  position?: string;
  category?: string;
  preferences?: string;
  logo?: string;
  coverImage?: string;
  handle: string;
  brandName: string;
  sellingInUS?: boolean;
  goals?: string;
  description?: string;
  brandImages?: string[];
  createdAt: Date;
  brandCreateData?: {
    brandMedia?: {
      type: string;
      url: string;
      name?: string;
    }[];
    logo?: {
      src: string;
    };
    logoUrl?: string;
  };
}

export interface CreateBrandData {
  name: string;
  website?: string;
  industry?: string;
  position?: string;
  category?: string;
  preferences?: string;
  logo?: string;
  coverImage?: string;
  brandName: string;
  sellingInUS?: boolean;
  goals?: string;
  description?: string;
  brandImages?: string[];
}

export const brandsService = {
  async getBrands(userId: string): Promise<{ success: boolean; data: Brand[]; count: number }> {
    const response = await fetch(`/api/brands/${userId}`);
    return response.json();
  },

  async createBrand(userId: string, brandData: CreateBrandData): Promise<{ success: boolean; data: Brand; message: string }> {
    const response = await fetch(`/api/brands/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brandData),
    });
    return response.json();
  },
};