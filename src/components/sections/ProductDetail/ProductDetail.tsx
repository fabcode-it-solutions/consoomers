/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import Spinner from "@/components/ui/Loader";
import CustomSwiper from "@/components/ui/Slider";
import type { Swiper as SwiperType } from "swiper";
import Heading from "@/components/ui/Heading";
import HowJoins from "../Homepage/HowJoins";
import WishListIcon from "@/assets/icon/WishListIcon";
import NotFound from "@/app/(main)/not-found";
import { useSession } from "next-auth/react";
import QuickVoteTooltip from "@/components/quickvote/QuickVoteTooltip";
import RequestSampleButton from "./SampleRequestButton";
import toast from "react-hot-toast";

interface Product {
  handle: string;
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  media: string[];
  price: string | number;
  createdBy?: string;
  sampleRequestsEnabled?: boolean;
}

interface Variant {
  id: string;
  name: string;
  sku: string;
  price: string;
  compareAtPrice?: string;
  stockQuantity: number;
  options: { [key: string]: string };
  image?: string;
  isDefault: boolean;
  isActive: boolean;
}

interface ProductOption {
  id: string;
  name: string;
  values: string[];
  position: number;
}

interface ProductDetailProps {
  handle: string;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ handle }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: string]: string;
  }>({});
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/product/get-product/${handle}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data.product);

        // Fetch variants if product exists
        if (data.product?.id) {
          await fetchVariants(data.product.id);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (handle) fetchProduct();
  }, [handle]);

  const fetchVariants = async (productId: string) => {
    try {
      const res = await fetch(`/api/product/variants?productId=${productId}`);
      if (res.ok) {
        const data = await res.json();
        const activeVariants =
          data.variants?.filter((v: Variant) => v.isActive) || [];
        setVariants(activeVariants);
        setOptions(data.options || []);

        // Set default variant
        const defaultVariant =
          activeVariants.find((v: Variant) => v.isDefault) || activeVariants[0];
        if (defaultVariant) {
          setSelectedVariant(defaultVariant);
          setSelectedOptions(defaultVariant.options);
        }
      }
    } catch (err) {
      console.error("Error fetching variants:", err);
    }
  };

  const handleOptionChange = (optionName: string, value: string) => {
    const newSelectedOptions = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(newSelectedOptions);

    // Find matching variant
    const matchingVariant = variants.find((variant) => {
      return Object.keys(newSelectedOptions).every(
        (key) => variant.options[key] === newSelectedOptions[key]
      );
    });

    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
      setQuantity(1);
    } else {
      setSelectedVariant(null);
      toast.error("This combination is not available");
    }
  };

  // const handleQuantityChange = (newQuantity: number) => {
  //   if (!selectedVariant) return;

  //   if (newQuantity < 1) {
  //     setQuantity(1);
  //     return;
  //   }

  //   if (newQuantity > selectedVariant.stockQuantity) {
  //     toast.error(`Only ${selectedVariant.stockQuantity} items available`);
  //     setQuantity(selectedVariant.stockQuantity);
  //     return;
  //   }

  //   setQuantity(newQuantity);
  // };

  const canRequestSample = product?.sampleRequestsEnabled !== false;
  const hasVariants = variants.length > 0;
  const displayPrice = selectedVariant?.price || product?.price || "0";
  const comparePrice = selectedVariant?.compareAtPrice;
  const inStock = selectedVariant ? selectedVariant.stockQuantity > 0 : true;
  const discount =
    comparePrice && displayPrice
      ? Math.round(
          ((parseFloat(comparePrice) - parseFloat(displayPrice.toString())) /
            parseFloat(comparePrice)) *
            100
        )
      : 0;

  // Get current images to display (variant image or product media)
  const displayImages = selectedVariant?.image
    ? [selectedVariant.image, ...(product?.media || [])]
    : product?.media || [];

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner className="w-12 h-12" />
      </div>
    );

  if (!product)
    return (
      <div className="flex justify-center items-center h-screen">
        <NotFound />
      </div>
    );

  return (
    <>
      <Container className="max-mb-xl:my-[15px]" bgColor="white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative max-mb-xl:gap-7 max-tab-lg:gap-6 mt-[50px]">
          <div className="flex flex-col sticky z-0 top-0 self-start max-tab-sm:relative">
            {/* Discount Badge */}
            {/* {discount > 0 && (
              <div className="absolute top-4 right-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                -{discount}%
              </div>
            )} */}

            <CustomSwiper
              slidesPerView={1}
              spaceBetween={10}
              showNavigation={false}
              onSwiper={setMainSwiper}
            >
              {displayImages.map((img, idx) => (
                <div key={idx} className="w-full h-full overflow-hidden">
                  <img
                    src={img}
                    alt={`${product.name} image ${idx}`}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </CustomSwiper>

            {displayImages.length > 1 && (
              <CustomSwiper slidesPerView={3} spaceBetween={2}>
                {displayImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`w-full overflow-hidden cursor-pointer ${
                      mainSwiper?.activeIndex === idx ? "shadow-lg" : ""
                    }`}
                    onClick={() => mainSwiper?.slideTo(idx)}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx}`}
                      className="w-full h-full object-cover overflow-hidden hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ))}
              </CustomSwiper>
            )}
          </div>

          <div className="flex flex-col gap-5 sticky top-[100px] self-start mt-[72px] max-w-[645px] w-full mr-auto max-mb-xl:mt-0 max-tab-lg:mt-[35px] max-mb-xl:gap-2 px-3 sm:px-0">
            <Heading
              level={1}
              className="text-3xl font-semibold max-mb-xl:text-[26px]"
            >
              {product.name}
            </Heading>

            {/* Price */}
            <div className="flex items-center gap-3">
              <p className="text-2xl font-normal text-primary">
                ${parseFloat(displayPrice.toString()).toFixed(2)}
              </p>
              {comparePrice &&
                parseFloat(comparePrice) >
                  parseFloat(displayPrice.toString()) && (
                  <p className="text-lg text-gray-500 line-through">
                    ${parseFloat(comparePrice).toFixed(2)}
                  </p>
                )}
            </div>

            {hasVariants && (
              <div className="flex items-center gap-2">
                {inStock ? (
                  <>
                    {/* <Check className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-medium">
                      In Stock ({selectedVariant?.stockQuantity || 0} available)
                    </span> */}
                  </>
                ) : (
                  <>
                    <span className="font-medium px-4 py-1.5 bg-black text-white rounded-full">
                      Sold Out
                    </span>
                  </>
                )}
              </div>
            )}

            {/* SKU
            {selectedVariant?.sku && (
              <p className="text-sm text-gray-500">SKU: {selectedVariant.sku}</p>
            )} */}

            {/* Description */}
            <div
              className="text-gray-600 max-w-[565px]"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            {/* Variant Options */}
            {hasVariants && options.length > 0 && (
              <div className="space-y-4  pt-4">
                {options
                  .sort((a, b) => a.position - b.position)
                  .map((option) => (
                    <div key={option.id}>
                      <label className="block text-sm font-semibold mb-3">
                        {option.name}
                        {selectedOptions[option.name] && (
                          <span className="font-normal text-gray-600 ml-2">
                            : {selectedOptions[option.name]}
                          </span>
                        )}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((value) => {
                          const isSelected =
                            selectedOptions[option.name] === value;

                          // Check if this combination is available
                          const isAvailable = variants.some((variant) => {
                            const testOptions = {
                              ...selectedOptions,
                              [option.name]: value,
                            };
                            return Object.keys(testOptions).every(
                              (key) => variant.options[key] === testOptions[key]
                            );
                          });

                          return (
                            <button
                              key={value}
                              onClick={() =>
                                handleOptionChange(option.name, value)
                              }
                              disabled={!isAvailable}
                              className={`
                                px-4 py-2 rounded-lg border-2 transition-all font-medium
                                ${
                                  isSelected
                                    ? "border-primary bg-blue-50 text-primary"
                                    : "border-gray-300 hover:border-gray-400 bg-white"
                                }
                                ${
                                  !isAvailable &&
                                  "opacity-40 cursor-not-allowed line-through"
                                }
                              `}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Quantity Selector */}
            {/* {hasVariants && inStock && selectedVariant && (
              <div className="space-y-2 border-t pt-4">
                <label className="block text-sm font-semibold">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center justify-center font-bold"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      handleQuantityChange(parseInt(e.target.value) || 1)
                    }
                    className="w-20 h-10 text-center border border-gray-300 rounded-lg"
                    min="1"
                    max={selectedVariant.stockQuantity}
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center justify-center font-bold"
                    disabled={quantity >= selectedVariant.stockQuantity}
                  >
                    +
                  </button>
                </div>
              </div>
            )} */}

            {/* Low Stock Warning */}
            {/* {selectedVariant &&
              selectedVariant.stockQuantity > 0 &&
              selectedVariant.stockQuantity <= 5 && (
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-orange-800">
                    Only {selectedVariant.stockQuantity} left in stock - order
                    soon!
                  </p>
                </div>
              )} */}

            {/* Selected Variant Info */}
            {/* {hasVariants && selectedVariant && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Selected:
                </p>
                <p className="text-sm text-blue-700">{selectedVariant.name}</p>
                {quantity > 1 && (
                  <p className="text-sm text-blue-700 mt-2">
                    Total: $
                    {(parseFloat(displayPrice.toString()) * quantity).toFixed(
                      2
                    )}
                  </p>
                )}
              </div>
            )} */}
            {session?.user?.id !== product.createdBy && (
              <div className="flex gap-[15px] w-full border-t pt-4">
                <>
                  {session?.user?.role === "tester" && canRequestSample && (
                    <RequestSampleButton
                      productId={product.id}
                      productName={product.name}
                    />
                  )}
                  <WishListIcon productId={product.id} entityType="product" />
                  <div className="w-full">
                    <QuickVoteTooltip
                      productId={product.id}
                      productPrice={displayPrice}
                    />
                  </div>
                </>
              </div>
            )}
            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 border-t pt-4">
                {product.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-200 text-sm capitalize rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
      <Container className="mt-[100px] max-mb-xl:mt-[15px] max-tab-lg:!px-0">
        <HowJoins showBrandButton={false} showConsumerButton={false} />
      </Container>
    </>
  );
};
export default ProductDetail;
