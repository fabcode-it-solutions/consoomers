import Heading from "@/components/ui/Heading";
import Image from "next/image";
import React from "react";
import CardLayout from "@/components/ui/CardLayout";

const Collections = () => {
  const products = [
    {
      image1: "/assets/images/turban2.webp",
      image2: "/assets/images/turbanproduct.webp",
      brand: "Organic Pure Mulberry Silk Turban",
      name: "EMILY'S PILLOW",
      price: "$80.00",
    },
    {
      image1: "/assets/images/sleepmask2.webp",
      image2: "/assets/images/sleepmask.webp",
      brand: "Organic Pure Mulberry Silk Lightweight Sleep Mask",
      name: "EMILY'S PILLOW",
      price: "$55.00",
    },
    {
      image1: "/assets/images/pillowcase2.webp",
      image2: "/assets/images/pillowcase.webp",
      brand: "100% Pure Mulberry Silk Zippered Pillowcase",
      name: "EMILY'S PILLOW",
      price: "$104.00",
    },
    {
      image1: "/assets/images/pillowcase2.webp",
      image2: "/assets/images/pillowcase.webp",
      brand: "100% Pure Mulberry Silk Zippered Pillowcase",
      name: "EMILY'S PILLOW",
      price: "$104.00",
    },
    {
      image1: "/assets/images/sleepmask2.webp",
      image2: "/assets/images/sleepmask.webp",
      brand: "Organic Pure Mulberry Silk Lightweight Sleep Mask",
      name: "EMILY'S PILLOW",
      price: "$55.00",
    },
  ];
  return (
    <section>
      <div className="max-w-[1300px] w-full flex flex-col md:flex-row mx-auto justify-center items-center gap-6 py-8">
        <div className="flex w-full md:w-1/2 justify-center items-center">
          <Heading level={1}>SKIN CARE</Heading>
        </div>

        <div className="flex w-full md:w-1/2 justify-center items-center">
          <div className="relative w-full h-[200px]">
            <Image
              src="/assets/images/skincare.webp"
              alt="Skin Care"
              fill
              className="object-cover rounded-xs md:px-0 px-4"
              priority
            />
          </div>
        </div>
      </div>

      <div className="mt-20 max-w-[1300px] mx-auto">
        <Heading
          level={1}
          className="flex items-center mx-auto justify-center text-center mb-5 font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#0051CC] to-[#00BFFF] "
        >
          Featured Products
        </Heading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {products.map((product, index) => (
            <CardLayout
              key={index}
              title={product.brand}
              category={product.name}
              image1={product.image1}
              image2={product.image2}
              price={product.price?.replace("$", "")}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collections;
