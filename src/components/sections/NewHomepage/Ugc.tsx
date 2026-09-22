"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Heading from "@/components/ui/Heading";

const features = [
  {
    icon: "/assets/images/image1.avif",
    title: "All Consumer Goods categories",
    description:
      "From beauty and wellness to F&B, home, and lifestyle, Consoomers captures how real people experience products across every facet of daily life.",
  },
  {
    icon: "/assets/images/image2.avif",
    title: '"A la carte" feedback',
    description:
      "Both brands and consumers choose their level of engagement, from quick polls and light reactions to in-depth product tests and full reviews.",
  },
  {
    icon: "/assets/images/image3.avif",
    title: "The smart complement to UGC",
    description:
      "We don't replace the buzz, we deepen it. Consoomers turns the emotion and visibility of UGC into structured insights brands can act on.",
  },
  {
    icon: "/assets/images/img4.avif",
    title: "Authentic and substantiated",
    description:
      "Every reaction is real, verified, and backed by tangible data, yet always anonymous and privacy-protected for our community.",
  },
  {
    icon: "/assets/images/image5.avif",
    title: "Driven by people, not algorithms",
    description:
      "Our strength lies in the community: diverse, engaged consumers who genuinely care about shaping the products they use.",
  },
  {
    icon: "/assets/images/image6.avif",
    title: "A touch of AI (but not too much)",
    description:
      "AI helps us analyze feedback at scale, identify trends, and surface what matters most, while keeping human context and authenticity at the heart of every insight.",
  },
];

const Ugc = () => {
  return (
    <section className="overflow-hidden">
      <div className="text-center mx-auto py-8 max-sm:px-4">
        <motion.p
          className="text-sm sm:text-base md:text-xl text-[#151515] leading-relaxed md:leading-loose mx-auto tracking-wide"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Consoomers complements UGC by grounding emotion in data, so brands
          don&apos;t just see <i>what</i> customers say, they understand <i>why</i> they say
          it.
          <br />
          Consumers don&apos;t live in controlled environments: they scroll,
          switch, and decide fast.
          <br />
          That&apos;s why Consoomers captures what really happens when products
          meet people.
          <br />
          No filters, no scripts, no marketing noise: unbiased feedback that
          turns into directions.
        </motion.p>
      </div>

      {/* HEADING SECTION */}
      <div className="flex flex-col items-center text-center mx-auto px-4 sm:px-0">
        <Heading>
          UGC builds awareness. Social listening gives hints. <br />
          Consoomers brings understanding.
        </Heading>
      </div>

      {/* FEATURES GRID */}
      <div className="max-w-[1200px] mx-auto my-10 px-4 sm:px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-x-4 gap-y-0 text-center">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-gray-800 max-w-[389.33px] w-full mx-auto tracking-wide "
            >
              <Image
                src={feature.icon}
                alt="feature"
                width={180}
                height={180}
                className="w-[212.5px] sm:w-[180px] md:w-[194.67px] h-auto"
              />
              <h3 className=" text-base sm:text-xl text-[#121212]">
                <strong>{feature.title}</strong>
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-[#151515] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Ugc;
