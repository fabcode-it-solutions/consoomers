import { Heart } from "lucide-react";
import React from "react";

interface CardProps {
  imageUrl?: string; // optional background image
  description?: string;
  className?: string; // extra classes
  children?: React.ReactNode; // optional content
}

export default function CustomCard({
  imageUrl,
  description,
  className,
  children,
}: CardProps) {
  return (
    <div
      className={` cursor-pointer hover:scale-101 flex flex-col bg-white shadow-md overflow-hidden border border-gray-200 ${className}`}
    >
      {imageUrl ? (
        <div className="relative w-full aspect-square !h-full">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          {/* Like heart */}
          <div className="absolute top-2 right-2">
            <Heart color="red" fill="red" />
          </div>
          {/* Overlay text */}
          {(description || children) && (
            <div className="absolute bottom-0 left-0 w-full bg-black/10 bg-opacity-50 text-white p-4">
              {description && <p className="text-sm">{description}</p>}
              {children}
            </div>
          )}
        </div>
      ) : (
        // If no image, just show content normally
        (description || children) && (
          <div className="p-4">
            {description && (
              <p className="text-gray-700 text-sm">{description}</p>
            )}
            {children}
          </div>
        )
      )}
    </div>
  );
}
