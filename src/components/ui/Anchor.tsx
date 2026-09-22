
import { AnchorType } from "@/types";
import Link from "next/link";
import React from "react";

const Anchor = ({ className, href, children }: AnchorType) => {
  return (
    <div className="flex  ">
      <Link 
       href={href}
       className={` py-[14.5px] px-[30px] bg-[#0060FF] leading-[1.25] text-base uppercase font-medium   font-workSans text-white  hover:opacity-90 transition-all duration-300 ease-in-out ${  className || "" } } `}
      >
       {children || ""}
      </Link>
    </div>
  );
};
export default Anchor;
