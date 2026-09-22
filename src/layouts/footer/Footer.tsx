import Image from "next/image";
import Link from "next/link";

import React, { useMemo } from "react";
// const Footer = () => {
//   const currentYears = useMemo(() => new Date().getFullYear(), []);

//   const footerLinks = [
//     {
//       title: "Community",
//       items: [
//         { name: "Join Community", href: "/" },
//         { name: "Content Creator Program", href: "" },
//         { name: "Read our Editorials", href: "" },
//         { name: "Community Discount Program", href: "" },
//       ],
//       className: "max-w-[236px]",
//     },
//     {
//       title: "Brands",
//       items: [
//         { name: "Brand Partnership", href: "" },
//         { name: "Review Packages", href: "" },
//         { name: "Video Content Packages", href: "" },
//         { name: "Survey Packages", href: "" },
//       ],
//       className: "max-w-[191px]",
//     },
//     {
//       title: "Company",
//       items: [
//         { name: "About Us", href: "/about-us" },
//         { name: "Contact Us", href: "/contact-us" },
//         { name: "Editorial Team", href: "" },
//         { name: "Advisory Board", href: "" },
//       ],
//       className: "max-w-[118px]",
//     },
//   ];

//   const bottomLinks = [
//     { name: "Privacy Policy", href: "/privacy-policy" },
//     { name: "Terms & Conditions", href: "/terms-conditions" },
//     { name: "Brand Terms", href: "" },
//     { name: "Site Terms", href: "" },
//   ];

//   return (
//     <div className="max-w-[1660] mx-auto px-[30px] max-tab-lg:px-4 w-full mt-[50px] mb-[61px] flex flex-col">
//       <div className="flex flex-row justify-between items-center">
//        <Link href="/"> <Image src="/assets/images/Logo.png" alt="" width={160} height={92} /> </Link>
//         <div className="flex flex-row gap-[15px]">
//           <IconInstagram fill="transparent" />
//           <IconFacebook fill="transparent" />

//           <svg
//             width="37"
//             height="36"
//             viewBox="0 0 37 36"
//             fill="none"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <rect
//               x="1.6001"
//               y="1"
//               width="34"
//               height="34"
//               rx="17"
//               stroke="#151515"
//               strokeWidth="2"
//             />
//             <path
//               d="M23.2829 10.168H25.7649L20.3438 16.3625L26.7211 24.793H21.729L17.8161 19.6813L13.3442 24.793H10.8586L16.6559 18.166L10.5422 10.168H15.661L19.1942 14.8402L23.2829 10.168ZM22.411 23.3094H23.7856L14.9122 11.5742H13.4356L22.411 23.3094Z"
//               fill="#151515"
//               stroke="#151515"
//               strokeWidth="0.0351562"
//             />
//           </svg>
//         </div>
//       </div>
//       <span className="my-[50px] border-[1px] border-[#D9D9D9]"></span>
//       <div className="flex flex-row max-w-[1145px] justify-between">
//         {footerLinks.map((group, idx) => (
//           <span
//             key={idx}
//             className={`${group.className} flex flex-col leading-[40px] text-[16px] font-medium`}
//           >
//             {group.items.map((link, i) => (
//               <Link key={i} href={link.href}>
//                 {link.name}
//               </Link>
//             ))}
//           </span>
//         ))}
//       </div>
//       <span className="my-[50px] border-[1px] border-[#D9D9D9]"></span>
//       <div className="flex lg:flex-row flex-col justify-between items-center">
//         <span className="flex flex-row gap-[40px] text-[#15151580] text-base font-medium">
//           {bottomLinks.map((link, i) => (
//             <Link key={i} href={link.href}>
//               {link.name}
//             </Link>
//           ))}
//         </span>
//         <span className="text-[#15151580] text-base font-medium mt-7 lg:mt-0">
//           © {currentYears} Consoomers. All rights reserved.
//         </span>
//       </div>
//     </div>
//   );
// };

// export default Footer;

const Footer = () => {
  const currentYears = useMemo(() => new Date().getFullYear(), []);

  const footerLinks = [
    { label: "Search", href: "/search" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms-conditions" },
    { label: "Contact Us", href: "/contact-us" },
  ];
  
  return (
    <div className="px-[30px] max-tab-sm:px-[15px] py-[36px] mt-[100px] max-sm:mt-4">
      <div className="flex justify-between !max-w-[1160px] w-full mx-auto">
        <div className="flex-1">
          <Link href="/" className="mb-[2rem]">
            <Image  
              src="/assets/images/Logo_Apr25_-_Emoticon.webp"
              alt="Consoomers logo"
              width={100}
              height={78}
            />
          </Link>
          <h2 className="text-[18px] mb-[20px] font-normal">Consoomers</h2>
          <p className="text-base font-normal text-[#121212]">
            Real Consumer Feedback. Smarter Product Launches.
          </p>
        </div>

        <ul className="flex flex-col gap-[10px] leading-[24px] text-sm font-normal flex-1 text-[#121212]">
          {footerLinks.map((link, index) => (
            <li key={index}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </div>

      <p className="my-[5rem] border-[1px]"></p>

      <span className="text-[#15151580] text-[11px] font-medium mt-7 lg:mt-0 text-center flex justify-center tracking-[0.07rem]">
        © {currentYears} Consoomers. All rights reserved.
      </span>
    </div>
  );
};

export default Footer;

