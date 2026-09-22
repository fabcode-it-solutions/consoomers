import Container from "@/components/ui/Container";
import Heading from "@/components/ui/Heading";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import CustomSwiper from "@/components/ui/Slider";

const brandData = [
  {
    id: 1,
    image: "/assets/images/brands/Rectangle 20.png",
    title: "EMILY‘S PILLOW",
    href: "/",
  },
  {
    id: 2,
    image: "/assets/images/brands/Rectangle 21.png",
    title: "EMILY‘S PILLOW",
    href: "/",
  },
  {
    id: 3,
    image: "/assets/images/brands/Rectangle 22.png",
    title: "EMILY‘S PILLOW",
    href: "/",
  },
  {
    id: 4,
    image: "/assets/images/brands/Rectangle 21.png",
    title: "EMILY‘S PILLOW",
    href: "/",
  },
];

const Brands = () => {
  return (
    <Container className="pt-[100px]">
      <Heading level={2} className="leading-[38px] w-fit">
        New Brands
      </Heading>
      <div className="pt-[50px]">
        <CustomSwiper slidesPerView={3} spaceBetween={50}>
          {brandData.map((brand) => (
            <div
              key={brand.id}
              className="relative !overflow-hidden group rounded-[20px]"
            >
              <Image
                src={brand.image}
                alt={brand.title}
                width={500}
                height={550}
                className="transition-transform duration-300 group-hover:scale-105"
              />

              <Link
                href={brand.href}
                className="absolute bottom-0 flex justify-between items-center
                  bg-[#00000066] pl-[28px] pr-[36px] w-full
                  transition-opacity duration-300 ease-in-out
                  group-hover:opacity-100 opacity-0
                  py-[13px] backdrop-blur-[7px]
                  rounded-bl-[20px] rounded-br-[20px]"
              >
                <h4 className="text-[20px] leading-[23px] font-medium text-white">
                  {brand.title}
                </h4>

                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 12H19"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 5L19 12L12 19"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          ))}
        </CustomSwiper>
      </div>
    </Container>
  );
};

export default Brands;
