"use client";

import Container from "@/components/ui/Container";
import Heading from "@/components/ui/Heading";
import ProductCard from "@/components/ui/ProductCard";
import CustomSwiper from "@/components/ui/Slider";


const products = [
  { image: "/assets/images/product/Rectangle 108.png", brand: "Emily's Pillow", name: "100% Pure Mulberry Silk Zippered Pillowcase", price: "$105.00" },
  { image: "/assets/images/product/Rectangle 109.png", brand: "LUC KIEFFER PARIS", name: "Bracelet - SOHO Collection", price: "$130.00" },
  { image: "/assets/images/product/Rectangle 110.png", brand: "LUC KIEFFER PARIS", name: "COEUR Charm Keychain", price: "$125.00" },
  { image: "/assets/images/product/Rectangle 111.png", brand: "Bachca", name: "Detangling and Shine Hairbrush", price: "$42.00" },
  { image: "/assets/images/product/Rectangle 109.png", brand: "LUC KIEFFER PARIS", name: "Bracelet - SOHO Collection", price: "$130.00" },
];

const Product = () => {
  return (
    <Container className="pt-[100px]">

      <div className="flex justify-between items-center">
        <Heading level={2} className="leading-[38px] w-fit">New Products</Heading>


        <div className="flex gap-2">
          <button className="swiper-button-prev cursor-pointer">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 29.3334C23.3638 29.3334 29.3333 23.3639 29.3333 16.0001C29.3333 8.63629 23.3638 2.66675 16 2.66675C8.63616 2.66675 2.66663 8.63629 2.66663 16.0001C2.66663 23.3639 8.63616 29.3334 16 29.3334Z" stroke="#151515" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 10.6667L10.6666 16.0001L16 21.3334" stroke="#151515" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21.3333 16H10.6666" stroke="#151515" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button className="swiper-button-next cursor-pointer">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 29.3334C8.63624 29.3334 2.6667 23.3639 2.6667 16.0001C2.6667 8.63629 8.63624 2.66675 16 2.66675C23.3638 2.66675 29.3334 8.63629 29.3334 16.0001C29.3334 23.3639 23.3638 29.3334 16 29.3334Z" stroke="#151515" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 10.6667L21.3334 16.0001L16 21.3334" stroke="#151515" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.6667 16H21.3334" stroke="#151515" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="pt-[50px]">
        <CustomSwiper slidesPerView={4} spaceBetween={40}>
          {products.map((product) => (
            <ProductCard key={product.name} {...product} />
          ))}
        </CustomSwiper>
      </div>
    </Container>
  );
};

export default Product;
