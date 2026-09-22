"use client";
import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import LoginPage from "@/components/auth/sign-in";

const YouAreIn = () => {
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    // stop animation after 2 seconds
    const timer = setTimeout(() => setAnimate(false), 2000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <section>
      <div className="text-center w-full py-8">
        <h1 className="text-[46px]">YAAAY! YOU&apos;RE IN!</h1>
      </div>
      <div className="py-8 md:pr-5 md:flex gap-4">
        <motion.div
          className="flex justify-center md:w-1/2"
          initial={{ x: 0 }}
          animate={animate ? { x: [-10, 10, -10] } : { x: 0 }}
          transition={{
            duration: 0.2,
            repeat: animate ? Infinity : 0,
            ease: "easeInOut",
          }}
        >
          <Image
            src="/assets/images/youarein.webp"
            alt="welcome-image"
            width={526}
            height={526}
            className="object-contain"
            priority
          />
        </motion.div>

        <div className="md:w-1/2 flex-col items-center mx-auto justify-center text-[20px] text-center leading-[1.75] tracking-[0.75]">
          <h1 className="text-[46px] text-center pb-5">What happens next?</h1>
          <p className="">
            Since we&apos;re just relaunching, we need a little time to bring
            exciting brands onto the site for you to discover. But hang
            tight—you&apos;ll soon start getting invitations to test new
            products.
          </p>
          <p>(Pro tip: keep an eye on your inbox 👀).</p>
          <p className="h-[36px]"></p>
          <p>
            Keep your profile up to date so we can match you with the products
            and opportunities you&apos;ll actually care about.
          </p>
          <p>
            In the meantime, spread the word! Invite your friends to join the
            community and get in on the fun.
          </p>
        </div>
      </div>
      <LoginPage />
    </section>
  );
};

export default YouAreIn;
