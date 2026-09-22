"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

const HeroSection = () => {
  const router = useRouter();
  return (
    <div className="relative group flex items-end justify-start w-full overflow-hidden">
      {/* First image – visible on tablet and larger screens */}
      <Image
        src="/assets/images/gempages_578484358860505985-3f0cb059-3a33-445f-a483-c6dffda1f47e.webp"
        alt="About Hero"
        quality={100}
        width={1440}
        height={757}
        className="hidden sm:block object-cover object-top w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[759px]"
      />

      {/* Second image – visible only on mobile */}
      <Image
        src="/assets/images/gempages-image.webp"
        alt="About Hero (Mobile)"
        quality={100}
        width={1440}
        height={757}
        className="block sm:hidden object-cover object-top w-full h-[400px]"
      />

      {/* Overlay */}
      <div className="absolute inset-0 md:bg-transparent transition-colors duration-300 group-hover:bg-black/25 bg-black/25"></div>

      {/* Hero Text */}
      <div className="absolute bottom-[-23] sm:bottom-11 left-0 sm:left-10 z-10 px-4 sm:px-8 sm:max-w-[90%] md:max-w-[650px]">
        <motion.div
          className="text-white space-y-5 md:space-y-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-[35px] sm:text-4xl lg:text-[57px] font-bold leading-tight">
            Real People.
            <br /> Real Feedback.
            <br /> Real Impact.
          </h1>
          <p className="text-lg md:text-xl font-light">
            The platform where products and people connect.
            <br />
            Built for CPG brands seeking real insights, and for consumers eager
            to test and shape what&apos;s next.
          </p>

          {/* ✅ Show this only on md and larger screens */}
          <div className="hidden md:flex flex-col md:flex-row items-center md:gap-5 gap-8 mb-10 w-full">
            <div className="flex items-center justify-around text-center mx-auto w-full">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white transform transition-all hover:scale-105 !py-[10px] md:!py-[14.5px] !px-[24px] md:!px-[30px]"
                onClick={() => router.push("/accounts/register/brand")}
              >
                FOR BRANDS
              </Button>
            </div>
            <div className="flex items-center justify-around text-center mx-auto w-full">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white transform transition-all hover:scale-105 !py-[10px] md:!py-[14.5px] !px-[24px] md:!px-[30px]"
                onClick={() => router.push("/accounts/register/tester")}
              >
                FOR TESTERS
              </Button>
            </div>
          </div>

          {/* ✅ Show this only on small screens (below md) */}
          <div className="flex md:hidden flex-col items-center gap-8 mb-10 w-full max-sm:gap-4">
            <div
              className="w-full bg-blue-600 hover:bg-blue-700 md:py-[14.5px] py-[10px] md:px-[30px] px-[24px] text-center"
              onClick={() => router.push("/accounts/register/brand")}
            >
              <button className="text-white transform transition-all hover:scale-105 font-bold">
                FOR BRANDS
              </button>
            </div>
            <div
              className="w-full bg-blue-600 hover:bg-blue-700 md:py-[14.5px] py-[10px] md:px-[30px] px-[24px] text-center"
              onClick={() => router.push("/accounts/register/tester")}
            >
              <button className="text-white transform transition-all hover:scale-105 font-bold">
                FOR TESTERS
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
