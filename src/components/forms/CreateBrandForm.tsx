"use client";

import { useState } from "react";
import { useApiRequest } from "@/hooks/useApiRequest";
import { CreateBrandData, Brand } from "@/services/brands";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import SelectField from "@/components/ui/SelectField";
import { MediaInput } from "@/components/global/media/upload/MediaInput";
import { MediaItem } from "@/types/media.types";

interface CreateBrandFormProps {
  userId: string;
  onSuccess: (brand: Brand) => void;
  onCancel: () => void;
}

const CreateBrandForm = ({
  userId,
  onSuccess,
  onCancel,
}: CreateBrandFormProps) => {
  const { request, loading } = useApiRequest<{
    success: boolean;
    data: Brand;
    message: string;
  }>();
  const [formData, setFormData] = useState<CreateBrandData>({
    name: "",
    brandName: "",
    website: "",
    industry: "",
    position: "",
    category: "",
    preferences: "",
    logo: "",
    coverImage: "",
    sellingInUS: false,
    goals: "",
    description: "",
    brandImages: [],
  });
  const [logo, setLogo] = useState<MediaItem | null>(null);
  const [brandImages, setBrandImages] = useState<MediaItem[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      logo: logo ? logo.id : null,
      brandImages: brandImages,
    };

    console.log("🧾 Brand form data submitted:", submitData);

    try {
      const result = await request({
        url: `/api/brands/${userId}`,
        options: {
          method: "POST",
          body: submitData,
        },
      });

      if (result?.success) {
        onSuccess(result.data);
      }
    } catch (error) {
      console.error("Error creating brand:", error);
    }
  };

  const handleChange = (
    field: keyof CreateBrandData,
    value: string | boolean | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };


  const CategoryOptions = [
    "Beauty",
    "Fashion",
    "Technology",
    "Food & Beverage",
    "Health & Wellness",
    "Home & Garden",
    "Other",
  ];

  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Brand</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Company Name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />

          <InputField
            label="Brand Name"
            value={formData.brandName}
            onChange={(e) => handleChange("brandName", e.target.value)}
            required
          />

          <InputField
            label="Website"
            type="url"
            value={formData.website}
            onChange={(e) => handleChange("website", e.target.value)}
          />

          <InputField
            label="Industry"
            value={formData.industry}
            onChange={(e) => handleChange("industry", e.target.value)}
          />

          <InputField
            label="Position"
            value={formData.position}
            onChange={(e) => handleChange("position", e.target.value)}
          />

          <SelectField
            label="Category"
            name="category"
            value={formData.category}
            onChange={(value) => handleChange("category", value as string)}
            options={CategoryOptions}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="sellingInUS"
            checked={formData.sellingInUS}
            onChange={(e) => handleChange("sellingInUS", e.target.checked)}
            className="rounded"
          />
          <label htmlFor="sellingInUS" className="text-sm">
            Selling in the US
          </label>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Goals</label>
          <textarea
            value={formData.goals}
            onChange={(e) => handleChange("goals", e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0060FF]"
            placeholder="Enter your brand goals"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0060FF]"
            placeholder="Enter brand description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MediaInput
            label="Brand Logo"
            mode="single"
            selectedMedia={logo ? [logo] : []}
            onChange={(files) => {
              const file = files[0] || null;
              setLogo(file);
            }}
            userId={userId}
            config={{
              allowedTypes: ["image"],
              maxFiles: 1,
              maxSize: 10,
            }}
          />

          <MediaInput
            label="Brand Images"
            mode="multiple"
            selectedMedia={brandImages}
            onChange={setBrandImages}
            userId={userId}
            config={{
              allowedTypes: ["image", "video"],
              maxFiles: 10,
              maxSize: 10,
            }}
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button className="text-white" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="text-white" type="submit">Create Brand</Button>
        </div>
      </form>
    </div>
  );
};

export default CreateBrandForm;
