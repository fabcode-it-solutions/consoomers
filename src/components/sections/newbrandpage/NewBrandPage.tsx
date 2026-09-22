/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState } from "react";
import Image from "next/image";
import Heading from "@/components/ui/Heading";
import CardLayout from "@/components/ui/CardLayout";
import WishListIcon from "@/assets/icon/WishListIcon";
import CustomSwiper from "@/components/ui/Slider";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import Container from "@/components/ui/Container";

const NewBrandPage = () => {
  const [activeTab, setActiveTab] = useState<"products" | "profile">("products");
  const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null);

  const media = [
    { type: "image", src: "/assets/images/collectionimage.webp", alt: "Bachca image" },
    { type: "video", src: "/assets/images/videopillow.mp4" },
  ];

  const products = [
    {
      title: "Organic Pure Mulberry Silk Turban",
      image1: "/assets/images/turbanproduct.webp",
      image2: "/assets/images/turban2.webp",
      category: "Emily's Pillow",
      price: "80.00",
      href: "#",
    },
    {
      title: "Organic Pure Mulberry Silk Lightweight Sleep Mask",
      image1: "/assets/images/sleepmask2.webp",
      image2: "/assets/images/sleepmask.webp",
      category: "Emily's Pillow",
      price: "55.00",
      href: "#",
    },
    {
      title: "100% Pure Mulberry Silk Zippered Pillowcase",
      image1: "/assets/images/pillowcase2.webp",
      image2: "/assets/images/pillowcase.webp",
      category: "Emily's Pillow",
      price: "104.00",
      href: "#",
    },
  ];

  return (
    <section className="w-full">
      {/* 🔹 Banner Section */}
      <div className="relative w-full h-[250px] sm:h-[260px] lg:h-[300px] overflow-hidden border-b-8 border-[#FAF6F2]">
        <Image
          src="/assets/images/emilyicon.webp"
          alt="brand banner"
          fill
          className="object-contain object-center bg-[#FAF6F2]"
          quality={100}
          priority
        />
      </div>

      {/* 🔹 Logo Section */}
      <div className="relative max-w-[1280px] mx-auto">
        <Image
          src="/assets/images/emilyimage.webp"
          alt="brand logo"
          width={160}
          height={160}
          className="rounded-full absolute -top-16 sm:-top-24 left-5 sm:left-10"
          quality={100}
          priority
        />
      </div>

      {/* 🔹 Brand Info Section */}
      <div className="w-full max-w-[1300px] mx-auto flex flex-col lg:flex-row items-center gap-8 mt-20 lg:mt-24 px-4 sm:px-6 lg:px-2">
        <div className="flex flex-col w-full lg:w-1/2 mt-8 md:mt-0">
          <Heading>EMILY&apos;S PILLOW</Heading>
          <p className="text-base sm:text-lg mt-3">
            Find products for your store from thousands of brands.
          </p>
          <p className="text-base mt-2">
            <span className="font-bold">Website : </span>
            <a
              href="https://emilyspillow.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline hover:text-blue-800"
            >
              https://emilyspillow.com
            </a>
          </p>
        </div>

        <div className="w-full lg:w-1/2 border p-4 rounded-sm shadow-sm mt-6 lg:mt-0">
          <p className="font-bold">About EMILY&apos;S PILLOW</p>
          <p className="mt-2 text-gray-700 text-sm sm:text-base">
            Emily&apos;s Pillow was born in France in 2020 out of a personal story and a
            genuine need — not just beauty marketing. Its founder, Laure Lagarde, an
            aerospace engineer turned innovator, was diagnosed with alopecia, an incurable
            autoimmune condition that causes hair loss.
          </p>
        </div>
      </div>

      {/* 🔹 Tabs Section */}
      <Container
        bgColor="white"
        className="w-full max-w-[1300px] mx-auto mt-12 px-4 sm:px-6 lg:px-2"
      >
        {/* Tab Buttons */}
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
              {products.map((product, index) => (
                <CardLayout
                  key={index}
                  title={product.title}
                  image1={product.image1}
                  image2={product.image2}
                  price={product.price}
                  href={product.href}
                  category={product.category}
                  WishListIcon={<WishListIcon />}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* 🔹 Media Swiper */}
              <div className="w-full lg:w-1/2 flex flex-col gap-1">
                <CustomSwiper slidesPerView={1} spaceBetween={10} onSwiper={setMainSwiper}>
                  {media.map((item, idx) => (
                    <div
                      key={idx}
                      className="w-full h-[300px] sm:h-[600px] md:h-[800px] relative"
                    >
                      {item.type === "image" ? (
                        <Image
                          src={item.src}
                          alt={item.alt || `Brand media ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <video
                          src={item.src}
                          autoPlay
                          muted
                          loop
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                </CustomSwiper>
              </div>

              {/* 🔹 About Section */}
              <div className="w-full lg:w-1/2 flex flex-col gap-4 text-sm sm:text-base">
                <Heading level={2} className="text-xl sm:text-2xl lg:text-3xl mb-4">
                  About EMILY&apos;S PILLOW
                </Heading>
                <span className="text-lg flex-col space-y-3 text-gray-800">
                  <p className="font-bold text-black">
                    Born in France, inspired by beauty, driven by purpose
                  </p>
                  <p>
                    Created by aerospace engineer Laure Lagarde after her own hair-loss
                    journey, Emily&apos;s Pillow designs silk pillowcases and sleep
                    accessories that blend French elegance with uncompromising quality.
                  </p>
                  <p>
                    Already trusted in Europe, the brand is now launching in the U.S. to
                    bring authentic beauty sleep to every home.
                  </p>
                  <p className="font-bold text-black">The brand&apos;s story</p>
                  <p>
                    Emily&apos;s Pillow was born in France in 2020 out of a personal story
                    and a genuine need — not just beauty marketing. Its founder, Laure
                    Lagarde, an aerospace engineer turned innovator, was diagnosed with
                    alopecia, an incurable autoimmune condition that causes hair loss.
                    Determined to create a meaningful solution, Laure built the brand with
                    purpose and precision. Every pillowcase is designed in line with the
                    strict codes of French beauty, reflecting the quality, elegance,
                    attention to detail, and skin-first approach that France is renowned
                    for.
                  </p>
                  <p>
                    <span className="font-bold text-black">The result: </span> uncompromising
                    silk quality, OEKO-TEX® certified safety, playful yet timeless designs,
                    and pricing that makes everyday luxury more accessible. Today, Laure
                    has not only managed to slow and even reverse her own hair loss, but
                    she has also helped thousands of men and women improve their daily
                    lives. Already a success in Europe, Emily&apos;s Pillow is now launching
                    in the U.S. — bringing French-driven quality, thoughtful design, and
                    better nights of beauty sleep to a new, demanding audience.
                  </p>
                </span>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default NewBrandPage;
