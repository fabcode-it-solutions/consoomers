import Anchor from "@/components/ui/Anchor";
import Container from "@/components/ui/Container";
import Heading from "@/components/ui/Heading";

import React from "react";

const WithoutSignUpBrandPage = () => {
  return (
    <Container bgColor="bg-transparent" className="mt-[40px]">
      <div>
        <Heading level={1} className="text-center">
          Welcome to Consoomers!​
        </Heading>
        <div className="flex flex-col mx-auto gap-[30px] max-tab-sm:gap-[20px] mt-[40px] text-[28px] max-tab-sm:text-[18px] max-tab-sm:mt-[20px] max-w-[1028px] px-[30px] max-tab-lg:px-[16px] max-tab-lg:max-w-[600px] max-w-[1028px] px-[30px] max-tab-lg:px-[16px] max-tab-lg:max-w-[600px] text-center">
          <p className=" ">
            We are a members only testing community built to protect the
            integrity of our feedback and the confidentiality of our brand
            partners.
          </p>
          <p className="">
            Only verified testers can browse the products featured in our
            campaigns. This ensures real opinions from real people, without
            noise, bias or outside traffic.​
          </p>
        </div>
      </div>
      <div className="flex flex-row mt-[100px] max-tab-sm:mt-[50px] gap-[50px] w-full max-mb-xl:flex-wrap max-w-[1028px] px-[30px] max-tab-lg:px-[16px] max-tab-md:max-w-full max-tab-lg:max-w-[600px] mx-auto">
        <div className="bg-[#0060FF] w-[50%] py-[30px] justify-center items-center flex flex-col gap-[20px] max-mb-xl:w-full">
          <h2 className="text-[24px] font-semibold text-white uppercase leading-[20px]">
            Brands
          </h2>
          <p className="text-[20px] font-normal text-white">
            Contact us to discuss opportunities.​
          </p>
          <Anchor href="/contact-us" className="bg-[#ffd400] !text-black">
            Contact Us
          </Anchor>
        </div>
        <div className="bg-[#ffd400] w-[50%] py-[30px] justify-center items-center flex flex-col gap-[20px] max-mb-xl:w-full">
          <h2 className="text-[24px] font-semibold text-black uppercase leading-[20px]">
            Tester
          </h2>
          <p className="text-[20px] font-normal text-black">
            Contact us to discuss opportunities.​
          </p>
          <div className="flex flex-row gap-[40px]">
            <Anchor href="/accounts/register/tester" className="">
              Join Us
            </Anchor>
            <Anchor href="/accounts/sign-in" className="">
              Login
            </Anchor>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default WithoutSignUpBrandPage;
