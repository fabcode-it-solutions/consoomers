"use client";
import Container from "@/components/ui/Container";
import React from "react";
import Image from "next/image";
import Heading from "@/components/ui/Heading";
const AboutUs = () => {
  return (
    <Container className="pt-[100px] flex flex-row items-center">
      <div className="w-[59.375%] bg-[white] h-fit py-[93px] pl-[80px] rounded-tl-[20px] rounded-bl-[20px]  flex flex-col gap-[20px]">
        <Heading level={2} className="text-[#151515] leading-[38px]">
          About Us
        </Heading>
        <p className="text-[20px] leading-[36px] font-normal text-[#151515] max-w-[716px]">
          Consoomers is where products and people meet for real.
          <br />
           We connect innovative brands with engaged consumers to test ideas,
          try products, and share authentic feedback that shapes what comes
          next. For brands, it means smarter decisions and stronger
          launches. For consumers, it means a voice in shaping tomorrow’s
          products and the chance to discover them first.
        </p>
      </div>
      <div className="w-[40.625%] group overflow-hidden rounded-[20px]">
        <Image
          src="/assets/images/Rectangle 8.png"
          alt="About Us"
          width={650}
          height={600}
          className=" transition-transform duration-300 group-hover:scale-105 rounded-[20px]"
        />
      </div>
    </Container>
  );
};

export default AboutUs;
