import React from "react";
import Image from "next/image";

interface ProductCardProps {
  image: string;
  brand: string;
  name: string;
  price: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  image,
  brand,
  name,
  price,
}) => {
  return (
    <div className="flex flex-col bg-white rounded-[20px] group overflow-hidden cursor-pointer h-[100%] ">
      <div className="relative w-full overflow-hidden">
        <Image
          src={image}
          alt={name}
          width={370}
          height={350}
          className="group-hover:scale-105 transition-transform duration-300 w-full h-auto"
        />
      </div>

      <span className="py-[19.5px] pl-[19px] flex flex-col gap-[10px]">
        <h4 className="text-base leading-[19px] text-[#151515B2] font-normal">
          {brand}
        </h4>
        <p className="text-base leading-[1.189] text-[#151515] font-medium max-w-[265px]">
          {name}
        </p>
        <p className="text-base pt-[5px] leading-[19px] text-[#151515B2] font-medium">
          From {price}
        </p>
      </span>
    </div>
  );
};

export default ProductCard;
