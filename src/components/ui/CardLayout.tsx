/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { useSession } from "next-auth/react";

interface CardLayoutProps {
  title: string;
  category?: string;
  image1?: string;
  image2?: string;
  price?: string;
  href?: string;
  productCreatorId?: string; 
  children?: React.ReactNode;
  WishListIcon?: React.ReactNode;
  imgHeight?:string
  status?:string ;
  statusBg?: string;

}

const CardLayout: React.FC<CardLayoutProps> = ({
  title,
  category,
  image1,
  image2,
  price,
  href,
  productCreatorId,
  children,
  WishListIcon,
  imgHeight = "max-h-[450px]",
  status ,
  statusBg 
}) => {
  const { data: session } = useSession();

  //  Hide wishlist for products created by the logged-in user
  const showWishlist = session?.user?.id !== productCreatorId;

  return (
    <div className="bg-white flex flex-col overflow-hidden group h-full duration-300">

      <div className="relative w-full cursor-pointer">
        {image1 && (
          <>
            <img
              src={image1}
              alt={title}
              className={`w-full object-cover  transition-opacity duration-500 ease-in-out ${imgHeight}`}
            />
            {image2 && (
              <img
                src={image2}
                alt={title}
                className="absolute top-0 left-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
              />
            )}
          </>
        )}

        {/*  Wishlist visibility handled inside */}
       {(showWishlist || status) && (
  <div className="absolute top-2 right-2 flex flex-col gap-2">
    {showWishlist && WishListIcon && (
      <div>{WishListIcon}</div>
    )}

    {status && (
     <div className={`absolute top-2 right-2 flex flex-col gap-2 px-4 py-1  ${statusBg}`}>
      <div>{status}</div>
      </div>
    )}
  </div>
)}

      </div>
      <div className="bg-[#F3F3F3] p-[1rem] h-full">
        {category && (
          <p className="font-bold text-md text-[#151515] mb-1">{category}</p>
        )}

        <span className="flex justify-between gap-5 items-center mb-2">
          <h2 className="text-base font-medium text-[#151515] ">{title}</h2>

          {href && (
            <a href={href}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.16666 10H15.8333"
                  stroke="#151515"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 4.16675L15.8333 10.0001L10 15.8334"
                  stroke="#151515"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          )}
        </span>

        {price && (
          <p className="font-normal mb-3 text-[#151515]">
            Retail Price <b className="font-semibold">${price}</b>
          </p>
        )}

        {children}
      </div>
    </div>
  );
};

export default CardLayout;
