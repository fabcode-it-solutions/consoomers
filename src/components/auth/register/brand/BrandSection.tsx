// "use client";
// import SignUpAsBrand from "@/components/auth/register/brand";
// import BrandBanner from "@/components/auth/register/brand/BrandBanner";
// import MoreaboutUs from "@/components/auth/register/brand/MoreaboutUs";
// import React, { useRef } from "react";

// const BrandSection = () => {
//   const formRef = useRef<HTMLDivElement>(null);

//   const scrollToForm = () => {
//     formRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   return (
//     <div>
//       <BrandBanner onGetStartedClick={scrollToForm} />
//       <div ref={formRef}>
//         <SignUpAsBrand />
//       </div>
//       <MoreaboutUs />
//     </div>
//   );
// };

// export default BrandSection;


"use client";
import React, { useRef } from "react";
import SignUpAsBrand from "@/components/auth/register/brand";
import BrandBanner from "@/components/auth/register/brand/BrandBanner";
import MoreaboutUs from "@/components/auth/register/brand/MoreaboutUs";
import { useEffect } from "react";

const BrandSection = () => {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
  if (window.location.hash === "#signup") {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  }
}, []);


  return (
    <div>
      <BrandBanner onGetStartedClick={scrollToForm} />
      <div ref={formRef}>
        <SignUpAsBrand />
      </div>
      <MoreaboutUs />
    </div>
  );
};

export default BrandSection;
