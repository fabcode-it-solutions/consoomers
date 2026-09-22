"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";

interface PromoSectionProps {
  title: string;
  heading: React.ReactNode;
  description: string;
  ctaText: string;
  switchText: string;
  bgClass: string;
  textClass: string;
  buttonClass: string;
  switchButtonClass: string;
  imageSrc: string;
  switchTo: string;
  mainButtonTo?: string;
  descriptionClass?: string;
  onCtaClick?: () => void;
}

const PromoSection: React.FC<PromoSectionProps> = ({
  title,
  heading,
  description,
  ctaText,
  switchText,
  bgClass,
  textClass,
  buttonClass,
  switchButtonClass,
  imageSrc,
  switchTo,
  mainButtonTo,
  descriptionClass,
  onCtaClick,
}) => {
  const router = useRouter();

  return (
    <section
      className={`relative overflow-hidden ${bgClass} py-20 md:py-20 `}
    >
      {/* Gradient Overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-[#e6f0ff]/30 pointer-events-none"></div>

      <div className="relative w-full px-10 max-sm:px-4 max-tab-lg:px-8 mx-auto grid md:grid-cols-2 items-center gap-10 md:gap-20">
        {/* LEFT SECTION */}
        <motion.div
          className={`flex flex-col ${textClass} space-y-6`}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[9px]">
            <h3 className="text-[28px] md:text-[36px] font-extrabold leading-tight tracking-tight">
              {title}
            </h3>

            <Button
              className={`text-lg flex items-center gap-[3px] px-5 py-2 ${switchButtonClass}`}
              onClick={() => router.push(switchTo)}
            >
              <span className="flex items-center gap-2">
              {switchText}
              <svg
                height="20"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                fill="currentColor"
              >
                <path d="M240.49,119.51l-96-96A12,12,0,0,0,124,32V68H80A12,12,0,0,0,68,80v96a12,12,0,0,0,12,12h44v36a12,12,0,0,0,20.49,8.49l96-96A12,12,0,0,0,240.49,119.51ZM148,195V176a12,12,0,0,0-12-12H92V92h44a12,12,0,0,0,12-12V61l67,67ZM52,80v96a12,12,0,0,1-24,0V80a12,12,0,0,1,24,0Z" />
              </svg>
              </span>
            </Button>
          </div>

          {/* Content */}
          <div className="mt-6">
            <Heading
              level={1}
              className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-gray-900"
            >
              {heading}
            </Heading>

            <p
              className={`text-lg md:text-xl font-medium leading-8 max-w-[550px] ${descriptionClass}`}
            >
              {description}
            </p>

            <div className="flex mt-8">
              <motion.button
                className={`text-lg md:text-xl font-semibold px-8 py-4 shadow-lg ${buttonClass}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (onCtaClick) {
                    onCtaClick();
                  } else if (mainButtonTo) {
                    router.push(mainButtonTo);
                  }
                }}
              >
                {ctaText}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* RIGHT IMAGE */}
        <motion.div
          className="flex justify-center items-center relative"
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
        >
          <div className="absolute -top-10 -right-10 w-[250px] h-[250px] bg-gradient-to-br from-[#0060FF]/20 to-[#00B4FF]/40 blur-3xl rounded-full animate-pulse"></div>

          <Image
            src={imageSrc}
            alt={title}
            width={420}
            height={520}
            className="relative object-contain z-9 drop-shadow-2xl"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default PromoSection;
