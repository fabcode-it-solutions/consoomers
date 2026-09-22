/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import SelectField from "@/components/ui/SelectField";
import InputField from "@/components/ui/InputField";
import toast from "react-hot-toast";
import Heading from "@/components/ui/Heading";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { useRouter, useParams } from "next/navigation";
import { MediaInput } from "@/components/global/media/upload/MediaInput";
import { MediaItem } from "@/types/media.types";
import { useAppSelector } from "@/libs/redux/hooks";
import { selectUser } from "@/libs/redux/selectors/selectors";
import ProductVariantsManager from "@/components/sections/ProductDetail/ProductVariantsManager";

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

export default function EditProductPage() {
  const user = useAppSelector(selectUser);
  const router = useRouter();
  const params = useParams();
  const productHandle = params?.handle as string;

  const [productId, setProductId] = useState<string>("");
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

  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [files, setFiles] = useState<MediaItem[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);

  const isAdmin =
    user?.role === "admin" ||
    ("isAdmin" in (user || {}) && (user as any).isAdmin === true);

  // Fetch product data by handle
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productHandle) return;

      setIsLoading(true);
      try {
        const res = await fetch(`/api/product/get-product/${productHandle}`);
        const json = await res.json();

        if (!res.ok) {
          toast.error(json.error || "Failed to fetch product");
          return;
        }

        const product = json.product;
        setProductId(product.id);

        // Populate form data
        setFormData({
          name: product.name || "",
          description: product.description || "",
          category: product.category || "",
          price: product.price?.toString() || "",
          tags: product.tags || [],
          media: product.media || [],
          brandLogo: product.brandData || "",
          handle: product.handle || "",
          brandId: product.brandId || undefined,
          brandName: product.brandName || "",
        });

        // Convert media URLs to MediaItem format
        const mediaItems: MediaItem[] = (product.media || []).map(
          (url: string, idx: number) => ({
            id: `media-${idx}`,
            src: url,
            type: url.match(/\.(mp4|webm|mov)$/i) ? "video" : "image",
          })
        );
        setFiles(mediaItems);

        // Set variants and options
        setVariants(product.variants || []);
        setOptions(product.options || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productHandle, user?.id, isAdmin, router]);

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

  const validate = () => {
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return false;
    }
    if (!formData.description?.trim()) {
      toast.error("Description is required");
      return false;
    }
    if (!formData.price || isNaN(Number(formData.price))) {
      toast.error("Valid numeric price required");
      return false;
    }
    if (isAdmin && !formData.brandName?.trim()) {
      toast.error("Brand name is required for admin");
      return false;
    }
    for (let i = 0; i < variants.length; i++) {
      if (!variants[i].price || isNaN(Number(variants[i].price))) {
        toast.error(
          `Variant ${variants[i].name || i + 1} needs a numeric price`
        );
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const mediaUrls = files.map((f) => f.src);

      const payload = {
        productId,
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
        options,
        variants: variants.map((v) => ({
          ...v,
          price: v.price?.toString?.() ?? "0",
          compareAtPrice: v.compareAtPrice?.toString?.() ?? null,
        })),
      };

      const res = await fetch(`/api/product/create-product`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to update product");
        setIsSubmitting(false);
        return;
      }

      toast.success("Product updated successfully!");
      router.push("/dashboard/products");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    )
      return;

    try {
      const res = await fetch(`/api/product/create-product`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to delete product");
        return;
      }

      toast.success("Product deleted successfully!");
      router.push("/dashboard/products");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-[#94a3b8] font-sofia-sans">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-100">
      <div className="mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#94a3b8] hover:text-[#f1f5f9] mb-4 font-sofia-sans transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </button>
          <Heading level={1} className="text-[#f1f5f9] font-sofia-sans">
            Edit Product
          </Heading>
          <p className="text-[#94a3b8] font-sofia-sans mt-2">
            Update the details below
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="bg-dark-100 border border-[#334155] p-6 space-y-6"
        >
          {isAdmin && (
            <InputField
              label="Brand Name (admin)"
              value={formData.brandName}
              onChange={(e) =>
                setFormData({ ...formData, brandName: e.target.value })
              }
              required
              className="bg-dark-200 !border-[#334155] text-[#f1f5f9]"
              labelClassName="!text-[#f1f5f9]"
            />
          )}

          <InputField
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="bg-dark-200 !border-[#334155] text-[#f1f5f9]"
            labelClassName="!text-[#f1f5f9]"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#f1f5f9] font-sofia-sans">
              Description
            </label>
            <RichTextEditor
              className="!bg-[#1e293b] dark-theme-editor"
              label=""
              labelClassName="!text-[#f1f5f9]"
              darkMode={true}
              value={formData.description}
              onChange={(val) => setFormData({ ...formData, description: val })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Price"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="bg-dark-200 !border-[#334155] text-[#f1f5f9]"
              labelClassName="!text-[#f1f5f9]"
            />

            <SelectField
              name="category"
              label="Category"
              options={categories}
              value={formData.category}
              onChange={(val) =>
                setFormData({ ...formData, category: val as string })
              }
              placeholder="Select Category"
              labelClassName="!text-[#f1f5f9]"
              triggerClassName="!bg-dark-200 !border-[#334155] !text-[#f1f5f9]"
              contentClassName="!bg-dark-200 !border-[#334155]"
            />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#f1f5f9] font-sofia-sans">
              Tags
            </label>
            <div className="flex gap-2">
              <InputField
                value={tagInput}
                label=""
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="bg-dark-200 !border-[#334155] text-[#f1f5f9]"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap">
              {formData.tags.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1.5 bg-[#334155] text-[#f1f5f9] rounded inline-flex items-center gap-2 font-sofia-sans text-sm"
                >
                  {t}
                  <button type="button" onClick={() => handleRemoveTag(t)}>
                    <X className="w-3 h-3 hover:text-red-400 transition" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Media Upload */}
          {user?.id && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#f1f5f9] font-sofia-sans">
                Product Images
              </label>
              <MediaInput
                label=""
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
            </div>
          )}

          {/* Variants */}
          <div className="border-t border-[#334155] pt-6">
            <ProductVariantsManager
              containerClass="bg-transparent border-neutral-700"
              innerClass="bg-transparent border-neutral-700"
              textClass="text-neutral-200"
              inputBorderClass="!border-[#334155]"
              initialVariants={variants}
              initialOptions={options}
              onChange={(data: any) => {
                setVariants(data.variants || []);
                setOptions(data.options || []);
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-[#334155]">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-sofia-sans"
            >
              {isSubmitting ? "Updating..." : "Update Product"}
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-sofia-sans"
            >
              Delete
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}