"use client";
import React from "react";
import IconArrow from "@/assets/icon/IconArrow";
import Heading from "@/components/ui/Heading";
import PromoSection from "@/components/bannercomponent/PromoSection";

interface TesterBannerProps {
  onSignUpClick?: () => void;
}

const TesterBanner: React.FC<TesterBannerProps> = ({ onSignUpClick }) => {
  return (
    <section className="overflow-hidden">
      {/* --- HERO / PROMO SECTION --- */}
      <PromoSection
        title="FOR TESTERS"
        heading={
          <span className="text-white">
            Your <span className="text-[#FFD400]">Voice</span> Matters!
            <br /> Let your opinion shape the future of brands.
          </span>
        }
        description="Try new things. Speak your mind. Influence what hits the shelves."
        descriptionClass="text-white"
        ctaText="Sign Up"
        switchText="BRANDS GO THIS WAY"
        bgClass="bg-gradient-to-r from-[#0048CC] via-[#0060FF] to-[#0078FF]"
        textClass="text-white"
        buttonClass="bg-[#FFD400] text-black hover:bg-yellow-400 transition-all duration-300"
        switchButtonClass="bg-transparent border border-white text-white hover:bg-white hover:text-black transition-all duration-300"
        imageSrc="/assets/images/testerbanner.webp"
        switchTo="/accounts/register/brand"
        onCtaClick={onSignUpClick}
      />

      {/* --- WHAT IS CONSOOMERS --- */}
      <div className="relative py-16 px-6 md:px-12 bg-gradient-to-b from-[#f9fbff] to-white w-full mx-auto my-16 ">
        <div className="text-center space-y-8">
          <Heading
            level={1}
            className="text-4xl md:text-5xl font-bold text-gray-900"
          >
            What is Consoomers?
          </Heading>

          <p className="text-[18px] md:text-[20px] leading-relaxed text-gray-700 max-w-3xl mx-auto font-sans">
            Consoomers is a community where you can rate and try new products,
            share your thoughts, and help shape what brands put out into the
            world.
            <br /> All this for free.
            <br />
            Jump into our tests and feedback programs to tell brands what real
            people really want. In return, you&apos;ll get early access to
            products, the chance to influence what makes it to shelves, and
            rewards for simply being honest.
            <br />
            No fancy posts (unless you want to). No pressure.{" "}
            <strong className="text-gray-900">
              Just your opinion — and it counts.
            </strong>
          </p>

          <div className="h-[3px] w-1/3 mx-auto bg-gradient-to-r from-[#FFD400] to-[#FFB800] rounded-full"></div>
        </div>
      </div>

      {/* --- WHAT'S IN IT FOR YOU / WHY HONESTY MATTERS --- */}
      <div className="w-full bg-gradient-to-r from-[#0060FF] to-[#0048CC] text-white py-16">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-12 px-6 md:px-10">
          {/* LEFT SECTION */}
          <div className="space-y-6">
            <Heading
              level={1}
              className="text-3xl md:text-4xl font-bold text-white"
            >
              What&apos;s in it for YOU
            </Heading>

            <ul className="flex flex-col gap-4 text-[18px] md:text-[20px] leading-8">
              <li className="flex items-center gap-3">
                <IconArrow /> Browse all brands at your own pace
              </li>
              <li className="flex items-center gap-3">
                <IconArrow /> Pick by category
              </li>
              <li className="flex items-center gap-3">
                <IconArrow /> Like, vote, and share your thoughts
              </li>
              <li className="flex items-center gap-3">
                <IconArrow /> Request samples or full-size products
              </li>
            </ul>
          </div>

          {/* RIGHT SECTION */}
          <div className="space-y-6 text-left md:text-right">
            <Heading
              level={1}
              className="text-3xl md:text-4xl font-bold text-white"
            >
              Why Honesty Matters
            </Heading>

            <div className="space-y-4 text-[17px] md:text-[19px] leading-8">
              <p>
                At <strong>Consoomers</strong>, your honest opinion is
                everything.
              </p>
              <p>
                This isn&apos;t about saying you love every product to get more
                freebies — it&apos;s about sharing what you really think.
              </p>
              <p>
                The more genuine your feedback, the more valuable it becomes —
                for you, for the brands, and for the community.
              </p>
              <p>That&apos;s what keeps Consoomers strong.</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- FINAL CTA --- */}
      <div className="max-w-[1000px] mx-auto mt-10 mb-20 px-6 text-center">
        <p className="text-[18px] md:text-[20px] leading-relaxed text-gray-700 font-medium">
          Browse our site and don&apos;t hold back. Be yourself. Say what you
          really think. <br />
          <span className="text-[#0060FF] font-semibold">
            That&apos;s how we make better products together.
          </span>
        </p>
      </div>
    </section>
  );
};

export default TesterBanner;
