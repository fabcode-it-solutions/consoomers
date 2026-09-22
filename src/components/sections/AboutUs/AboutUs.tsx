"use client";
import { useRouter } from "next/navigation";
import React from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import { motion } from "framer-motion";

const AboutUs = () => {
  const router = useRouter();

  return (
    <section className="overflow-hidden">
      {/* ===== HERO SECTION ===== */}

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
            <div className="absolute bottom-[-12] sm:bottom-11 left-0 sm:left-10 z-10 px-4 sm:px-8 sm:max-w-[90%] md:max-w-[650px]">
              <motion.div
                className="text-white space-y-5 md:space-y-6"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-[35px] sm:text-4xl lg:text-[57px] font-bold leading-tight">
                  Honest Feedback.<br/> Smarter Brands.<br/> Happier Customers.
                </h1>
                <p className="text-lg md:text-xl font-light">
                   The platform where products and people truly connect.
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
                <div className="flex md:hidden flex-col items-center gap-8 mb-10 w-full">
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

      {/* ===== DESCRIPTION SECTION ===== */}
      <div className="flex flex-col items-center text-center mx-auto py-12 px-6">
        <motion.p
          className="text-base sm:text-lg md:text-xl leading-relaxed max-w-[940px]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <i>
            <strong>Consoomers</strong>
          </i>{" "}
          is where products and people meet for real.
          <br />
          We connect innovative brands with engaged consumers to test ideas, try
          products, and share authentic feedback that shapes what comes next.
          <br />
          For brands, it means smarter decisions and stronger launches.
          <br />
          For consumers, it means a voice in shaping tomorrow&apos;s products — and
          the chance to discover them first.
        </motion.p>
      </div>

      {/* ===== BRAND / TESTER SECTION ===== */}
      <div className=" text-white max-w-[1300px] mx-auto my-12c py-12">
  <div className="mx-auto grid md:grid-cols-2 gap-10 text-center">
    
    {/* BRAND CARD */}
    <div className="flex flex-col items-center bg-[#0060ff] p-8">
      <Heading level={2} className="text-white mb-4">If you&apos;re a BRAND</Heading>
      <Image
        src="/assets/images/brand0.avif"
        alt="Brand Illustration"
        width={177}
        height={177}
        className="mb-6 border-4 border-white"
      />
      <h2 className="text-2xl font-semibold mb-4">Your Edge Starts With Real Feedback</h2>
      <p className="text-base leading-relaxed max-w-[400px]">
        <strong>Consoomers delivers real, dynamic consumer feedback</strong>, straight from U.S. customers who engage with your products.
        {/* <br /> */}
        Not another review site. Not social listening.
        {/* <br /> */}
        In today&apos;s market, <strong>guesswork is too expensive.</strong>
        {/* <br /> */}
        <strong>Real validation gives you the edge.</strong>
      </p>
      <Button onClick={() => router.push("/accounts/register/brand")} className="bg-[#FFD700] text-black hover:bg-yellow-400 mt-6 w-full">
        Join as a BRAND
      </Button>
    </div>

    {/* TESTER CARD */}
    <div className="flex flex-col items-center bg-[#0060ff] p-8">
      <Heading level={2} className="text-white mb-4">If you&apos;re a TESTER</Heading>
      <Image
        src="/assets/images/tester0.avif"
        alt="Tester Illustration"
        width={177}
        height={177}
        className="mb-6 border-4 border-white"
      />
      <h2 className="text-2xl font-semibold mb-4">Share Your Opinion. Shape What&apos;s Next.</h2>
      <p className="text-base leading-relaxed max-w-[400px]">
        <strong>With Consoomers, you get early access to new products and the power to shape what comes next through real, unbiased feedback.</strong>
       
        No polished posts. No complex content. Just your honest opinion.
       
        In today&apos;s world, <strong>your voice matters more than ever.</strong>
       
        <strong>Real, human feedback</strong> is the true power.
      </p>
      <Button onClick={() => router.push("/accounts/register/tester")} className="bg-[#FFD700] text-black hover:bg-yellow-400 mt-6 w-full">
        Join as a TESTER
      </Button>
    </div>

  </div>
</div>

    </section>
  );
};

export default AboutUs;
