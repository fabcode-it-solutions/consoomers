import React, { ReactNode, JSX } from "react";
type HeadingProps = {
  as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  children: ReactNode;
  className?: string;
};

const baseStyles: Record<string, string> = {
  h1: "text-[40px] font-bold text-[#151515] ",
  h2: "text-[32px] text-[#151515] font-semibold",
  h3: "",
  h4: "",
  h5: "",
  h6: "",
  default: "",
};

const Heading = ({ as, className, children }: HeadingProps) => {
  const Tag = `${as}` as keyof JSX.IntrinsicElements;
  const headingClass = `${
    baseStyles[as] || baseStyles["default"]
  } ${className}`;

  return <Tag className={headingClass}>{children}</Tag>;
};

export default Heading;
