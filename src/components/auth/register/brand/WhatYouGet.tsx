"use client";

import React from "react";
import Image from "next/image";
import Heading from "@/components/ui/Heading";

const WhatYouGet = () => {
  const features = [
    {
      img: "/assets/images/usconsumers.webp",
      text: "Our nationwide community of qualified testers is ready to share their thoughts on your brand and products.",
    },
    {
      img: "/assets/images/community.avif",
      text: "Get introduced and accessible to our entire community once your brand is approved and listed.",
    },
    {
      img: "/assets/images/targettedreach.avif",
      text: "We match your products with the consumers who fit your audience profile, so the feedback is relevant and reliable.",
    },
    {
      img: "/assets/images/honestreaction.avif",
      text: "From first impressions to detailed feedback, responses are unprompted and authentic.",
    },
    {
      img: "/assets/images/effortlesstesting.avif",
      text: "We handle the logistics for both physical and digital products, making it easy to get your products into the hands of testers.",
    },
    {
      img: "/assets/images/realworld.avif",
      text: "Understand how your product is received in real life. Use tangible data to refine your messaging, packaging, and positioning.",
    },
  ];

  return (
    <section className="w-full flex flex-col justify-center items-center mx-auto py-20 px-6 bg-gradient-to-b from-[#ffffff] via-[#f9fbff] to-[#f1f6ff]">
      {/* Section Title */}
      <div className="text-center mx-auto">
        <Heading
          level={1}
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
        >
          What You Get
        </Heading>
        <p className="text-[18px] md:text-[20px] text-gray-700 leading-9 font-sans">
          <strong>Exposure -</strong> Showcase your brand and products to
          qualified U.S. consumers through listings, likes, and quick votes.{" "}
          <br />
          <strong>Insights -</strong> Run surveys to understand consumer
          preferences and market potential. <br />
          <strong>Feedback -</strong> Gather authentic reviews and detailed
          feedback through sampling or full-size product testing.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-10 w-full md:px-4 mt-16">
        {features.map((item, index) => (
          <div
            key={index}
            className="group bg-white/90 backdrop-blur-md border border-gray-200 p-4  md:p-8 flex flex-col items-center text-center"
          >
            <div className="flex items-center justify-center bg-gradient-to-br shadow-md mb-6">
              <Image
                src={item.img}
                alt="Feature image"
                width={194}
                height={194}
                className="object-contain drop-shadow-lg"
              />
            </div>

            <p className="text-[17px] text-gray-800 leading-8 font-medium">
              {item.text}
            </p>

            <div className="w-1/3 h-[3px] bg-gradient-to-r from-[#FFD400] to-[#FFB800] mt-6 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          </div>
        ))}
      </div>

      {/* Decorative Divider */}
      <div className="max-w-[1200px] w-full h-[3px] bg-gradient-to-r from-[#0060FF] to-[#00B4FF] mx-auto mt-16 rounded-full"></div>
    </section>
  );
};

export default WhatYouGet;
