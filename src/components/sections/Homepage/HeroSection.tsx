// import Anchor from "@/components/ui/Anchor";
// import Heading from "@/components/ui/Heading";
// import React from "react";

// const HeroSection = () => {
//   return (
//     <div className="my-[100px]  max-w-[860px] px-[30px] w-full mx-auto text-center">
//       <div className="flex flex-col gap-[20px]">
//         <p className="text-base leading-[1.25] text-[#15151580] font-normal">
//           Honest Feedback - Smarter Brands - Happier Customers.
//         </p>
//         <Heading level={1}>Welcome to Consoomers</Heading>
//         <p className="max-w-[705px] mx-auto text-base leading-[24px] text-[#15151580] font-normal text-center">
//           The platform where products and people truly connect.
//           <br />
//           Built for CPG brands seeking real, unbiased insights, and for
//           consumers eager to discover, test and shape what’s next.
//         </p>
//       </div>
//       <div className="flex flex-col mt-[20px] gap-[40px]">
//         <div className="relative flex justify-between border-[#15151580] border-[1px] rounded-[50px]  pl-[30px] pr-[102px]">
//           <input
//             type="text"
//             placeholder="Search"
//             className="text-base leading-[1.2] py-[20.5px] w-full  focus:outline-none "
//           />

//           <div className="absolute top-0 right-0  h-full flex items-center pl-[0px] pr-[45px]">
//             <div className="pr-[33px]">
//               <svg
//                 width="1"
//                 height="48"
//                 viewBox="0 0 1 48"
//                 fill="#15151580"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <rect width="1" height="48" fill="#151515" fillOpacity="0.5" />
//               </svg>
//             </div>
//             <svg
//               width="24"
//               height="24"
//               viewBox="0 0 24 24"
//               fill="none"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 d="M21 21L16.66 16.66"
//                 stroke="#151515"
//                 strokeOpacity="0.5"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//               <path
//                 d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
//                 stroke="#151515"
//                 strokeOpacity="0.5"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//             </svg>
//           </div>
//         </div>
//         <div className="flex gap-5 justify-center">
//           <Anchor href="/accounts/register/brand">Join as a BRAND</Anchor>
//           <Anchor href="/accounts/register/tester">Join as a CONSUMER</Anchor>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HeroSection;


"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Anchor from "@/components/ui/Anchor";
import Heading from "@/components/ui/Heading";

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="my-[100px] max-w-[860px] px-[30px] w-full mx-auto text-center">
      <div className="flex flex-col gap-[20px]">
        <p className="text-base leading-[1.25] text-[#15151580] font-normal">
          Honest Feedback - Smarter Brands - Happier Customers.
        </p>
        <Heading level={1}>Welcome to Consoomers</Heading>
        <p className="max-w-[705px] mx-auto text-base leading-[24px] text-[#15151580] font-normal text-center">
          The platform where products and people truly connect.
          <br />
          Built for CPG brands seeking real, unbiased insights, and for
          consumers eager to discover, test and shape what&apos;s next.
        </p>
      </div>

      <div className="flex flex-col mt-[20px] gap-[40px]">
        {/*  Search Bar */}
        <div className="relative flex justify-between border-[#15151580] border-[1px] rounded-[50px] pl-[30px] pr-[102px]">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search"
            className="text-base leading-[1.2] py-[20.5px] w-full focus:outline-none"
          />

          <div
            onClick={handleSearch}
            className="absolute top-0 right-0 h-full flex items-center pl-[0px] pr-[45px] cursor-pointer"
          >
            <div className="pr-[33px]">
              <svg
                width="1"
                height="48"
                viewBox="0 0 1 48"
                fill="#15151580"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="1" height="48" fill="#151515" fillOpacity="0.5" />
              </svg>
            </div>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 21L16.66 16.66"
                stroke="#151515"
                strokeOpacity="0.5"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
                stroke="#151515"
                strokeOpacity="0.5"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-5 justify-center">
          <Anchor href="/accounts/register/brand">Join as a BRAND</Anchor>
          <Anchor href="/accounts/register/tester">Join as a CONSUMER</Anchor>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

