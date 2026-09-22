import Container from "@/components/ui/Container";
import React from "react";
import Image from "next/image";
import Heading from "@/components/ui/Heading";
import Anchor from "@/components/ui/Anchor";

interface HowJoinsProps {
  showBrandButton?: boolean;   
  showConsumerButton?: boolean; 
}

const HowJoins: React.FC<HowJoinsProps> = ({
  showBrandButton = true,
  showConsumerButton = true,
}) => {
  return (
    <Container className="pt-[100px] flex flex-row gap-[50px] w-full pb-[118px] max-mb-xl:py-[26px] max-mb-xl:flex-col max-tab-lg:gap-[26px]">
      {/* BRAND Section */}
      <div className="bg-white rounded-none max-w-[50%] pt-[56px] w-full flex flex-col max-mb-xl:gap-[16px] gap-[50px] justify-center items-center pb-[80px] max-mb-xl:max-w-full max-mb-xl:py-[30px] ">
        <h4 className="text-[24px] leading-[28px] font-bold text-center ">
          If you&#39;re a <span className="text-[#0060FF]">BRAND</span>
        </h4>
        <Image
          src="/assets/images/Ellipse 4.png"
          alt="Brand"
          width={260}
          height={260}
          className=" max-tab-lg:w-[200px] max-tab-lg:h-[200px]"
        />
        <div className="flex flex-col gap-[20px] justify-center items-center px-[15px]">
          <Heading
            level={2}
            className="leading-[38px] !font-medium text-center text-[#151515d] max-tab-lg:text-[24px]"
          >
            Your Edge Starts With Real Feedback
          </Heading>
          <p className="text-[20px] leading-[36px] font-normal text-center text-[#151515] max-w-[629px] mb-[20px] max-tab-lg:text-base max-tab-lg:leading-[24px]">
            Consoomers delivers real, dynamic consumer feedback, straight from
            U.S. customers who engage with your products. <br />
            Not another review site. Not social listening.
            <br />
            In today’s market, guesswork is too expensive. <br />
            Real validation gives you the edge.
          </p>
          {showBrandButton && (
            <Anchor href="/accounts/register/brand">
              Join as a BRAND
            </Anchor>
          )}
        </div>
      </div>

      <div className="bg-white rounded-none max-w-[50%] pt-[56px] w-full flex flex-col max-mb-xl:py-[30px] gap-[50px] justify-center items-center pb-[80px] max-mb-xl:max-w-full max-mb-xl:gap-[16px] ">
        <h4 className="text-[24px] leading-[28px] font-bold text-center">
          If you&#39;re a <span className="text-[#0060FF]">TESTER</span>
        </h4>
        <Image
          src="/assets/images/Ellipse 5.png"
          alt="Consumer"
          width={260}
          height={260}
          className="flex max-tab-lg:w-[200px] max-tab-lg:h-[200px]"
        />
        <div className="flex flex-col gap-[20px] justify-center items-center px-[15px]">
          <Heading
            level={2}
            className="leading-[38px] !font-medium text-center text-[#151515d] max-tab-lg:text-[24px]"
          >
            Share Your Opinion. Shape What’s Next.
          </Heading>
          <p className="text-[20px] leading-[36px] font-normal text-center text-[#151515] max-w-[629px] mb-[20px] max-tab-lg:text-base max-tab-lg:leading-[24px]">
            With Consoomers, you get early access to new products and the power
            to shape what comes next through real, unbiased feedback. No
            polished posts. No complex content. Just your honest opinion. <br />
            In today’s world, your voice matters more than ever. Real, human
            feedback is the true power.
          </p>
          {showConsumerButton && (
            <Anchor href="/accounts/register/tester">
              Join as a CONSUMER
            </Anchor>
          )}
        </div>
      </div>
    </Container>
  );
};

export default HowJoins;
