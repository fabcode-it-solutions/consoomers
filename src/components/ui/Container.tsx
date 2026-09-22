import { ReactNode } from "react";

interface ContainerProps {
  className?: string;
  children: ReactNode;
  bgColor?: string; 
}

const Container: React.FC<ContainerProps> = ({ className, children, bgColor }) => {
  return (
    <div className={bgColor || "bg-[#FAF6F2]"}> 
      <div
        className={`max-w-[1660px] mx-auto px-[30px] max-mb-xl:px-4 max-tab-lg:px-7 ${
          className || ""
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default Container;
