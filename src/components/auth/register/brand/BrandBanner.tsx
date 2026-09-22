"use client";
import React from "react";
import Heading from "@/components/ui/Heading";
import PromoSection from "@/components/bannercomponent/PromoSection";
import WhatYouGet from "./WhatYouGet";

interface BrandBannerProps {
  onGetStartedClick?: () => void;
}


const BrandBanner: React.FC<BrandBannerProps> = ({ onGetStartedClick }) => {
  return (
    <section className="overflow-hidden">
      {/* --- HERO / PROMO SECTION --- */}
      <PromoSection
        title="FOR BRANDS"
        heading="Get Exposure. Hear What Real Consumers Think."
        description="Consoomers gives your brand direct, unbiased access to U.S. consumers, offering spontaneous, unfiltered reactions and feedback that reflect how your brand and products will perform in the real world."
        descriptionClass="text-gray-700" 
        ctaText="Get Started"
        switchText="TESTERS GO THIS WAY"
        bgClass="bg-gradient-to-r from-[#FFD400] to-[#ffef9f]"
        textClass="text-black"
        buttonClass="bg-black text-white hover:bg-gray-800 transition-all duration-300"
        switchButtonClass="bg-transparent border border-black text-black hover:bg-black hover:text-white transition-all duration-300"
        imageSrc="/assets/images/brandbanner.webp"
        switchTo="/accounts/register/tester"
        onCtaClick={onGetStartedClick}
      />

      {/* --- ABOUT CONSOOMERS --- */}
      <div className="relative py-16 px-6 md:px-15 bg-gradient-to-b from-[#fffaf0] max-sm:px-4 to-white wshadow-lg w-full mx-auto my-14 border border-[#f8ddb4]/60">
        <div className="text-center space-y-8">
          <Heading level={1} className="text-4xl md:text-5xl font-bold text-gray-900">
            What is Consoomers?
          </Heading>

          <p className="text-[18px] md:text-[20px] leading-relaxed text-gray-700 mx-auto font-sans">
            <strong>
              Whether you&apos;re entering the U.S. market, launching a new
              product, or aiming to boost sales, Consoomers helps you uncover
              what your target audience truly wants and reacts to.
            </strong>
            <br />
            <br />
            We connect your brand with our curated community of engaged American
            consumers, so you can gather feedback, gain insights, validate
            ideas, and shape products that resonate.
            <br />
            <br />
            Depending on your plan, you&apos;ll get quick reactions, simple
            votes, deeper insights that go beyond star ratings, and authentic
            reviews.
            <br />
            <br />
            <strong className="text-black">
              Always honest. Never sugarcoated or biased.
              <br />
              No algorithms. Just real people.
            </strong>
          </p>

          <div className="h-[3px] w-1/3 mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
        </div>
      </div>

      {/* --- FEATURES / BENEFITS SECTION --- */}
      <div className="bg-gradient-to-r from-blue-50 via-white to-blue-50 py-12 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6 max-sm:px-4 ">
          <WhatYouGet />
        </div>
      </div>
    </section>
  );
};

export default BrandBanner;
