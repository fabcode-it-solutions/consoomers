import { ButtonType } from "@/types";
import React from "react";

const Button = ({ className, children, onClick, type }: ButtonType) => {
  return (
    <div className="flex  ">
      <button
        type={type}
        onClick={onClick}
        className={`py-[14.5px]  cursor-pointer px-[30px] bg-[#0060FF]  leading-[1.25] text-base uppercase font-medium  font-workSans hover:opacity-90 transition-all duration-300 ease-in-out ${
          className || ""
        }`}
      >
        {children || "Sign Up"}
      </button>
    </div>
  );
};
export default Button;
