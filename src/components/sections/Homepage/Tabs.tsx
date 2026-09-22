"use client";

import Container from "@/components/ui/Container";
import React from "react";
import Image from "next/image";
import * as RadixTabs from "@radix-ui/react-tabs";

const Tabs = () => {
  return (
    <Container className="pt-[80px]">
      <RadixTabs.Root defaultValue="tab1">
        {/* Tab Triggers */}
        <RadixTabs.List className="flex justify-center gap-[70px] flex-row">
          <RadixTabs.Trigger value="tab1" asChild className="justify-center">
            <div className="flex flex-col gap-5 justify-center items-center cursor-pointer">
              <Image
                src="/assets/images/Rectangle 17.png"
                alt="Tab1"
                width={200}
                height={100}
              />
              <h3 className="text-sm font-medium text-[#151515] leading-[16px]">
                Beauty & Wellness
              </h3>
            </div>
          </RadixTabs.Trigger>

          <RadixTabs.Trigger value="tab2" asChild>
            <div className="flex flex-col gap-5 justify-center items-center cursor-pointer">
              <Image
                src="/assets/images/Rectangle 18.png"
                alt="Tab2"
                width={200}
                height={100}
              />
              <h3 className="text-sm font-medium text-[#151515] leading-[16px]">
                Fashion Accessories
              </h3>
            </div>
          </RadixTabs.Trigger>

          <RadixTabs.Trigger value="tab3" asChild>
            <div className="flex flex-col gap-5 justify-center items-center cursor-pointer">
              <Image
                src="/assets/images/Rectangle 19.png"
                alt="Tab3"
                width={200}
                height={100}
              />
              <h3 className="text-sm font-medium text-[#151515] leading-[16px]">
                Personal Care Accessories
              </h3>
            </div>
          </RadixTabs.Trigger>
        </RadixTabs.List>
        {/* Tab Content */}
        {/* <RadixTabs.Content value="tab1" className="mt-8">
          <p>Content for Beauty & Wellness</p>
        </RadixTabs.Content>
        <RadixTabs.Content value="tab2" className="mt-8">
          <p>Content for Fashion Accessories</p>
        </RadixTabs.Content>
        <RadixTabs.Content value="tab3" className="mt-8">
          <p>Content for Personal Care Accessories</p>
        </RadixTabs.Content> */}
      </RadixTabs.Root>
    </Container>
  );
};

export default Tabs;
