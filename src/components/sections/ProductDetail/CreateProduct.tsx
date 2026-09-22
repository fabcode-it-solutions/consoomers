/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import SelectField from "@/components/ui/SelectField";
import InputField from "@/components/ui/InputField";
import toast from "react-hot-toast";
import Heading from "@/components/ui/Heading";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { useRouter } from "next/navigation";
import { MediaInput } from "@/components/global/media/upload/MediaInput";
import { MediaItem } from "@/types/media.types";
import { useAppSelector } from "@/libs/redux/hooks";
import { selectUser } from "@/libs/redux/selectors/selectors";
import ProductVariantsManager from "./ProductVariantsManager";

interface FormData {
  name: string;
  description: string;
  category: string;
  tags: string[];
  price: string;
  media: string[];
  brandLogo?: string;
  handle?: string;
  brandId?: string;
  brandName?: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  category?: string;
  price?: string;
  brandName?: string;
}

const categories = [
  "Beauty & Personal Care",
  "Fitness & Wellness",
  "Food & Beverage",
  "Fashion & Accessories",
  "Home & Garden",
  "Tech & Electronics",
  "Kids & Baby Products",
  "Pet Products",
  "Other",
];

export default function CreateProductPage() {
  const user = useAppSelector(selectUser);
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    category: "",
    price: "",
    tags: [],
    media: [],
    brandLogo: "",
    handle: "",
    brandId: undefined,
    brandName: "",
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<MediaItem[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [showVariants, setShowVariants] = useState(false);

  const isAdmin =
    user?.role === "admin" ||
    ("isAdmin" in (user || {}) && (user as any).isAdmin === true);

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const validate = (): boolean => {
    const errors: FormErrors = {};

    // Product name is required
    if (!formData.name.trim()) {
      errors.name = "Product name is required";
    }

    // Description is required
    if (!formData.description?.trim()) {
      errors.description = "Description is required";
    }

    // Price is required and must be numeric
    if (!formData.price) {
      errors.price = "Price is required";
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errors.price = "Price must be a valid positive number";
    }

    // Category is required
    if (!formData.category) {
      errors.category = "Category is required";
    }

    // Brand name is required for admin
    if (isAdmin && !formData.brandName?.trim()) {
      errors.brandName = "Brand name is required";
    }

    // Validate variants ONLY if variants exist (they are optional)
    if (variants && variants.length > 0) {
      for (let i = 0; i < variants.length; i++) {
        if (!variants[i].price || isNaN(Number(variants[i].price)) || Number(variants[i].price) <= 0) {
          toast.error(`Variant ${variants[i].name || i + 1} needs a valid numeric price`);
          return false;
        }
      }
    }

    setFormErrors(errors);

    // If there are any errors, show toast and return false
    if (Object.keys(errors).length > 0) {
      toast.error("Please fill in all required fields");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const mediaUrls = files.map((f) => f.src);

      const payload: any = {
        product: {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          price: formData.price,
          tags: formData.tags,
          media: mediaUrls,
          brandLogo: formData.brandLogo || null,
          handle: formData.handle || null,
          brandId: formData.brandId || null,
          brandName: isAdmin ? formData.brandName : undefined,
        },
      };

      // Only include options and variants if they exist
      if (options && options.length > 0) {
        payload.options = options;
      }

      if (variants && variants.length > 0) {
        payload.variants = variants.map((v) => ({
          ...v,
          price: v.price?.toString?.() ?? "0",
          compareAtPrice: v.compareAtPrice?.toString?.() ?? null,
        }));
      }

      const res = await fetch("/api/product/create-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to create product");
        setIsSubmitting(false);
        return;
      }

      toast.success("Product created successfully!");

      // Reset everything
      setFormData({
        name: "",
        description: "",
        category: "",
        price: "",
        tags: [],
        media: [],
        brandLogo: "",
        handle: "",
        brandId: undefined,
        brandName: "",
      });
      setFormErrors({});
      setFiles([]);
      setVariants([]);
      setOptions([]);

      router.push("/products");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear error when user starts typing
  const handleFieldChange = (field: keyof FormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors({ ...formErrors, [field]: undefined });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br p-8">
      <div className="w-full max-w-[900px] mx-auto my-[40px]">
        <Heading level={1} className="text-center">
          Create Product
        </Heading>
        <p className="text-[#15151580] text-center mb-6">
          Fill in the details below
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="p-6 border rounded space-y-6 bg-white"
        >
          {isAdmin && (
            <div>
              <InputField
                label="Brand Name (admin)"
                value={formData.brandName}
                onChange={(e) => handleFieldChange("brandName", e.target.value)}
                required
              />
              {formErrors.brandName && (
                <p className="text-red-500 text-sm mt-1">{formErrors.brandName}</p>
              )}
            </div>
          )}

          <div>
            <InputField
              label="Product Name"
              value={formData.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              required
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
            )}
          </div>

          <div>
            <RichTextEditor
              label="Description"
              value={formData.description}
              onChange={(val) => handleFieldChange("description", val)}
              required
            />
            {formErrors.description && (
              <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputField
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => handleFieldChange("price", e.target.value)}
                required
              />
              {formErrors.price && (
                <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
              )}
            </div>

            <div>
              <SelectField
                name="category"
                label="Category"
                options={categories}
                value={formData.category}
                onChange={(val) => handleFieldChange("category", val as string)}
                placeholder="Select Category"
                required
              />
              {formErrors.category && (
                <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="flex gap-2">
            <InputField
              value={tagInput}
              label="Add Tag"
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add tag"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <div className="flex items-end">
            <Button type="button" onClick={handleAddTag} className="max-h-[50px] ">
              <Plus className="w-4 h-4" />
            </Button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {formData.tags.map((t) => (
              <span
                key={t}
                className="px-2 py-1 bg-blue-100 rounded inline-flex items-center gap-2"
              >
                {t}
                <button type="button" onClick={() => handleRemoveTag(t)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Media Upload */}
          {user?.id && (
            <MediaInput
              label="Gallery"
              mode="multiple"
              selectedMedia={files}
              onChange={setFiles}
              userId={user.id}
              config={{
                allowedTypes: ["image", "video"],
                maxFiles: 10,
                maxSize: 20,
              }}
            />
          )}

          {/* Variants (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">Product Variants (Optional)</h3>
              <Button
                type="button"
                onClick={() => setShowVariants(!showVariants)}
               
              >
                {showVariants ? "Hide Variants" : "Add Variants"}
              </Button>
            </div>
            
            {showVariants && (
              <ProductVariantsManager
                onChange={(data: any) => {
                  setVariants(data.variants || []);
                  setOptions(data.options || []);
                }}
              />
            )}
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" >
              {isSubmitting ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}