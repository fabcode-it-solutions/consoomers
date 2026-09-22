// FILE: SingleMediaPreview.tsx - FIXED VERSION
"use client";

import React, { useCallback, useMemo } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { MediaItem } from "@/types/media.types";

interface SingleMediaPreviewProps {
  media?: MediaItem;
  onRemove: () => void;
  onClick: () => void;
}

const SingleMediaPreview = React.memo<SingleMediaPreviewProps>(
  ({ media, onRemove, onClick }) => {
    const handleRemove = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onRemove();
      },
      [onRemove]
    );

    // Get the source URL - support both 'src' and 'url'
    const mediaSrc = useMemo(() => {
      if (!media) return null;
      const src = media.src || media.url;
      // CRITICAL: Check if source exists and is valid
      if (!src || typeof src !== "string") return null;
      const trimmed = src.trim();
      if (trimmed === "") return null;
      return trimmed;
    }, [media]);

    // Memoize whether media is an image
    const isImage = useMemo(
      () => media && (media.type === "image" || media.type === "vector"),
      [media]
    );

    // Memoize file display info
    const fileInfo = useMemo(
      () => ({
        filename: media?.filename || media?.name || "Unknown file",
        type: media?.type || "file",
      }),
      [media]
    );

    // CRITICAL: If no valid media source, show upload UI
    if (!media || !mediaSrc) {
      return (
        <button
          type="button"
          onClick={onClick}
          className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-5/20 border-dashed rounded-lg cursor-pointer hover:border-gray-5/40 transition-colors bg-gray-5/5"
        >
          <div className="flex flex-col items-center">
            <Upload className="w-8 h-8 mb-2 text-gray-4" />
            <p className="text-sm text-gray-4 font-sofia-sans">
              Click to select media
            </p>
          </div>
        </button>
      );
    }

    // CRITICAL: Only render Image if mediaSrc is valid
    return (
      <div className="relative w-full h-48 border-2 border-gray-5/20 rounded-lg overflow-hidden group">
        {isImage && mediaSrc ? (
          <Image
            src={mediaSrc}
            alt={media.alt || "Selected media"}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
            onError={(e) => {
              console.error("Image load error:", e);
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-5/10">
            <div className="text-center">
              <p className="text-sm font-medium text-light-100 font-sofia-sans mb-1">
                {fileInfo.filename}
              </p>
              <p className="text-xs text-gray-4 font-sofia-sans capitalize">
                {fileInfo.type}
              </p>
            </div>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={onClick}
            className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-sofia-sans transition-colors"
          >
            Change
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className="p-2 bg-red-500/60 hover:bg-red-500/80 rounded-lg text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }
);

SingleMediaPreview.displayName = "SingleMediaPreview";

export default SingleMediaPreview;

