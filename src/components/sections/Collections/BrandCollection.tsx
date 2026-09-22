/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Heading from "@/components/ui/Heading";
import CardLayout from "@/components/ui/CardLayout";
import WishListIcon from "@/assets/icon/WishListIcon";
import CustomSwiper from "@/components/ui/Slider";
import Spinner from "@/components/ui/Loader";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import WithoutSignUpBrandPage from "./WithoutSignUpBrandPage";

interface BrandData {
  id: string;
  userId?: string;
  brandId: string;
  brandName: string;
  website?: string;
  category?: string;
  goals?: string;
  sellingInUS?: string;
  description?: string;
  brandImages?: string[];
  logo?: string;
  brandCreateData?: {
    brandMedia?: any[];
    logo?: {
      src: string;
    };
    logoUrl?: string;
  };
}

interface ProductCardProps {
  id: string;
  handle: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  media: string[];
  price: string;
  createdBy?: string;
  showWishlist?: boolean;
}

interface CollectionBannerProps {
  brandHandle: string;
}

const CollectionBanner = ({ brandHandle }: CollectionBannerProps) => {
  const { data: session, status } = useSession();
  const [brand, setBrand] = useState<BrandData | null>(null);
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "profile">(
    "products"
  );
  const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null);

  useEffect(() => {
    async function fetchBrand() {
      try {
        setLoading(true);
        const res = await fetch(`/api/brandData?handle=${brandHandle}`);
        const data = await res.json();
        console.log(data, "data");

        if (res.status === 404) {
          setError("Brand Not Found");
          return;
        }
        if (!res.ok || !data.success)
          throw new Error(data.error || "Brand not found");

        setBrand(data.brand);
        setProducts(data.products || []);
        console.log("Brand fetched:", data.brand.brandName);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBrand();
  }, [brandHandle]);

  // Show loading while checking auth status
  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  // Show error if brand not found
  if (error || !brand) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-red-500">
        <div className="text-center">
          <p className="text-2xl font-semibold">{error || "Brand not found"}</p>
        </div>
      </div>
    );
  }

  // Show WithoutSignUpBrandPage for unauthenticated users
  if (status === "unauthenticated" || !session) {
    return (
      <div className="flex justify-center items-center mt-10">
        <WithoutSignUpBrandPage />
      </div>
    );
  }

  // Get media items from brandCreate data (submitted form) or fallback to brand.brandImages
  const getBrandMedia = () => {
    // First try to get from brandCreate data if available
    if (
      brand.brandCreateData?.brandMedia &&
      brand.brandCreateData.brandMedia.length > 0
    ) {
      return brand.brandCreateData.brandMedia.map(
        (media: any, index: number) => ({
          type: media.type || "image",
          src: media.src || media.url || media,
          alt: `${brand.brandName} banner ${index + 1}`,
        })
      );
    }
    // Check if brandImages contains full media objects (new format)
    if (brand.brandImages && brand.brandImages.length > 0) {
      // Check if first item is an object (new format) or string (old format)
      const firstItem = brand.brandImages[0];
      if (typeof firstItem === "object" && firstItem !== null) {
        // New format: array of media objects
        return brand.brandImages.map((media: any, index: number) => ({
          type: media.type || "image",
          src: media.src || media.url,
          alt: media.alt || `${brand.brandName} banner ${index + 1}`,
        }));
      } else {
        // Old format: array of strings
        return brand.brandImages.map((src: string, index: number) => ({
          type: "image",
          src:
            src.startsWith("http") ||
            src.startsWith("/") ||
            src.startsWith("data:")
              ? src
              : `/assets/images/${src}`,
          alt: `${brand.brandName} banner ${index + 1}`,
        }));
      }
    }
    // Default fallback
    return [
      {
        type: "image",
        src: "/assets/images/brand-image.png",
        alt: "Default banner",
      },
    ];
  };

  const mediaItems = getBrandMedia();

  return (
    <section className="w-full">
      {/* 🔹 Banner Section */}
      <div className="bg-gray-200 relative w-full h-[250px] sm:h-[250px] lg:h-[550px]  overflow-hidden border-b-8 border-[#FAF6F2]">
        <CustomSwiper slidesPerView={1} spaceBetween={0}>
          {mediaItems.map((item: any, index: number) => (
            <div
              key={index}
              className="relative h-[250px] w-full  md:mx-auto sm:h-[250px] lg:h-[550px] overflow-hidden "
            >
              {item.type === "image" ? (
                <Image
                  src={item.src}
                  alt={item.alt || "Brand media"}
                  fill
                  className="w-[1920px] h-[330px] lg:h-[550px] duration-500 hover:scale-105 object-cover"
                  quality={100}
                  priority={index === 0}
                />
              ) : (
                <video
                  src={item.src}
                  className="w-full h-full object-cover object-center bg-[#FAF6F2] transition-transform duration-500 hover:scale-105"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              )}
            </div>
          ))}
        </CustomSwiper>
      </div>

      {/* 🔹 Brand Logo */}
      <div className="relative max-w-[1280px] mx-auto z-1">
        <div className="absolute -top-16 sm:-top-24 left-5 sm:left-10 w-40 h-40 sm:w-50 sm:h-50 rounded-full overflow-hidden border-2 border-white shadow-md">
          <Image
            src={
              brand.brandCreateData?.logoUrl ||
              brand.brandCreateData?.logo?.src ||
              brand.logo ||
              "/assets/images/nologo.png"
            }
            alt="brand logo"
            fill
            className="object-cover rounded-full"
            quality={100}
            priority
          />
        </div>
      </div>

      {/* 🔹 Brand Info Section */}
      <div className="w-full max-w-[1300px] mx-auto flex flex-col lg:flex-row items-center gap-8 mt-20 lg:mt-24 px-4 sm:px-6 lg:px-2">
        <div className="flex flex-col w-full lg:w-1/2 mt-8 md:mt-0">
          <Heading>{brand.brandName}</Heading>
          <p className="text-base sm:text-lg mt-3">
            Find products for your store from thousands of brands.
          </p>
        </div>

        <div className="w-full lg:w-1/2 border p-4 rounded-sm shadow-sm mt-6 lg:mt-0 text-lg flex-col space-y-3">
          {brand.category && (
            <p>
              <strong>Category:</strong> {brand.category}
            </p>
          )}

          {brand.goals &&
            (Array.isArray(brand.goals) ? (
              brand.goals.length === 1 ? (
                //  Only one goal
                <p>
                  <strong>Goals:</strong> {brand.goals[0]}
                </p>
              ) : (
                //  More than one goal
                <div>
                  <strong>Goals:</strong>
                  <ul className="mt-1 space-y-1 list-disc ml-5">
                    {brand.goals.map((goal, index) => (
                      <li key={index}>{goal}</li>
                    ))}
                  </ul>
                </div>
              )
            ) : (
              //  If backend sends a single string instead of array
              <p>
                <strong>Goals:</strong> {brand.goals}
              </p>
            ))}

          {brand.sellingInUS && (
            <p>
              <strong>Sold in US:</strong> {brand.sellingInUS}
            </p>
          )}
          {brand.website && (
            <p>
              <span className="font-bold">Website : </span>
              <a
                href={brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline hover:text-blue-800"
              >
                {brand.website}
              </a>
            </p>
          )}
        </div>
      </div>

      {/* 🔹 Tabs Section */}
      <div className="w-full max-w-[1300px] mx-auto mt-12 px-4 sm:px-6 lg:px-2">
        {/* Tabs */}
        <div className="flex border-b border-gray-300 md:justify-normal justify-center">
          {["products", "profile"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "products" | "profile")}
              className={`px-9 sm:px-6 py-3 text-2xl sm:text-lg font-medium transition-all duration-200 ${
                activeTab === tab
                  ? "border-b-2 border-black text-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              {tab === "products" ? "All Products" : "Brand's Profile"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === "products" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <CardLayout
                  key={product.id}
                  title={product.name}
                  image1={product.media?.[0]}
                  image2={product.media?.[1]}
                  price={product.price}
                  href={`/products/${product.handle}`}
                  productCreatorId={product.createdBy}
                  category={product.category}
                  WishListIcon={
                    <WishListIcon productId={product.id} entityType="product" />
                  }
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* 🔹 Media Swiper */}
              <div className="w-full lg:w-1/2 flex flex-col gap-1">
                <CustomSwiper
                  slidesPerView={1}
                  spaceBetween={10}
                  onSwiper={setMainSwiper}
                >
                  {mediaItems.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="w-full h-[300px] sm:h-[600px] md:h-[800px] relative"
                    >
                      <Image
                        src={item.src}
                        alt={item.alt || `${brand.brandName} image ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </CustomSwiper>
              </div>

              {/* 🔹 About Section */}
              <div className="w-full lg:w-1/2 flex flex-col gap-4 text-sm sm:text-base">
                <Heading className="mb-4">About {brand.brandName}</Heading>
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                  {brand.description ||
                    `This brand focuses on authentic design, sustainability, and innovation. Bringing thoughtful craftsmanship and timeless style to every product.  Created by aerospace engineer Laure Lagarde after her own hair-loss journey, Emily's Pillow designs silk pillowcases and sleep accessories that blend French elegance with uncompromising quality.`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CollectionBanner;