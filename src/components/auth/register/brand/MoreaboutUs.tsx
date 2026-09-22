"use client";

import React from "react";
import Heading from "@/components/ui/Heading";

const MoreaboutUs = () => {
  const items = [
    {
      title: "What We Do",
      content:
        "We bridge the gap between what brands want to sell and what U.S. consumers are ready to buy—delivering localized, real-world, and data-backed insights to de-risk your market entry. By integrating Consoomers into your launch plans, you can avoid costly misfires, fine-tune your offering, and accelerate toward sustainable success.",
    },
    {
      title: "Who We Are",
      content:
        "Consoomers is a NYC-based collective of multicultural experts with over two decades of experience launching and scaling consumer and luxury brands in the U.S. Our team brings deep expertise in go-to-market strategy, financial modeling, branding, creative direction, and digital and retail growth.",
    },
    {
      title: "Who It's For",
      content:
        "Consoomers is designed for small to medium brands and stakeholders who can't afford to guess: International brands preparing to enter the U.S. market, U.S.-based companies launching new products or expanding into new categories, Product design and development labs willing to validate product/market fit throughout the conception phase, Investors, incubators, and accelerators looking to de-risk product launches and make data-informed decisions.",
    },
  ];

  return (
    <section className="max-w-[1200px] mx-auto px-6 py-20 max-sm:px-4 max-sm:py-7">
      {/* Section Heading */}
      <div className="text-center mb-14">
        <Heading
          level={1}
          className="text-4xl md:text-5xl font-bold text-gray-900"
        >
          More About Us
        </Heading>
        <div className="h-[4px] w-20 bg-gradient-to-r from-[#0060FF] to-[#00B4FF] mx-auto mt-4 "></div>
      </div>

      {/* Cards Section */}
      <div className="grid md:grid-cols-3 gap-8">
        {items.map((item, index) => (
          <div
            key={index}
            className="group relative bg-gradient-to-b from-[#0060FF] to-[#0048CC] text-white  shadow-2xl p-6 md:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-3xl"
          >
            {/* Decorative Overlay */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl"></div>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-2xl font-semibold">{item.title}</h3>
            </div>

            {/* Content */}
            <p className="text-[16px] leading-relaxed text-white/90">
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MoreaboutUs;
