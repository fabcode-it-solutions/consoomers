"use client";

import React, { ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import type { Swiper as SwiperType } from "swiper";

interface CustomSwiperProps {
  children: ReactNode[];
  slidesPerView?: number;
  spaceBetween?: number;
  showNavigation?: boolean;
  prevArrow?: ReactNode;
  nextArrow?: ReactNode;
  onSwiper?: (swiper: SwiperType) => void; 
}

const CustomSwiper: React.FC<CustomSwiperProps> = ({
  children,
  slidesPerView = 4,
  spaceBetween = 40,
  showNavigation = false,
  prevArrow,
  nextArrow,
  onSwiper, 
}) => {
  return (
    <div className="relative w-full">
      <Swiper
        className="flex items-start relative "
        modules={showNavigation ? [Navigation] : []}
        navigation={
          showNavigation
            ? {
                prevEl: prevArrow ? ".custom-prev" : undefined,
                nextEl: nextArrow ? ".custom-next" : undefined,
              }
            : false
        }
        slidesPerView={slidesPerView}
        spaceBetween={spaceBetween}
        
        onSwiper={onSwiper} 
      >
        {children.map((child, index) => (
          <SwiperSlide key={index} className="!h-[100%]">
            {child}
          </SwiperSlide>
        ))}

        {showNavigation && prevArrow && (
          <div className="custom-prev absolute left-2 top-1/2 -translate-y-1/2 z-10 cursor-pointer">
            {prevArrow}
          </div>
        )}
        {showNavigation && nextArrow && (
          <div className="custom-next absolute right-2 top-1/2 -translate-y-1/2 z-10 cursor-pointer">
            {nextArrow}
          </div>
        )}
      </Swiper>
    </div>
  );
};

export default CustomSwiper;
