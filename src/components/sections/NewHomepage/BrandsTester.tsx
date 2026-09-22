"use client";
import React from "react";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

const data = [
  {
    title: "BRANDS",
    subtitle: "Ready to see what people really think?",
    description:
      "Contact us to define your campaign objectives and explore the insights you want to generate.",
    buttonText: "CONTACT US",
     link: "/accounts/register/brand#signup",
  },
  {
    title: "TESTERS",
    subtitle: "Ready to share your voice?",
    description:
      "Join a community of curious consumers shaping the products of tomorrow.",
    buttonText: "SIGN UP NOW",
     link: "/accounts/register/tester#form",
  },
];

const BrandsTester = ({
}) => {
  const router = useRouter();
  return (
    <section className="overflow-hidden">
      <div className="w-full bg-[#0060ff] text-white pt-5 max-w-[1200px] mx-auto mt-8">
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-5 text-center px-5 md:px-20"> */}
        <div className="flex flex-wrap text-center gap-y-5 px-5 md:px-20 justify-evenly">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center w-auto max-w-[500px]">
              <h3 className="italic font-bold text-base md:text-xl tracking-wide p-4">
                <span className="uppercase">{item.title}</span>
                <p className="italic font-bold text-base md:text-xl">
                  <strong>{item.subtitle}</strong>
                </p>
              </h3>

              <p className="text-sm sm:text-[18px] leading-loose p-4">
                {item.description}
              </p>

              <Button
                className="bg-[#FFD600] text-black my-5 hover:bg-yellow-400"
                 onClick={() => router.push(item.link)}
              >
                {item.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsTester;
