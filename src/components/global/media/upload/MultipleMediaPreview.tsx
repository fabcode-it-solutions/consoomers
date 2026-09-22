/* eslint-disable @typescript-eslint/no-explicit-any */
// FILE: MultipleMediaPreview.tsx
"use client";

import React, { useCallback, useMemo } from "react";
import Image from "next/image";
import { File, Music, Upload, X } from "lucide-react";
import { MediaItem } from "@/types/media.types";

interface MultipleMediaPreviewProps {
  media: MediaItem[];
  onRemove: (id: string) => void;
  onClick: () => void;
}

// Helper to validate media source
const isValidMediaSource = (media: any): boolean => {
  if (!media) return false;
  const src = media?.src || media?.url;
  if (!src || typeof src !== "string") return false;
  return src.trim() !== "";
};

const MultipleMediaPreview = React.memo<MultipleMediaPreviewProps>(
  ({ media = [], onRemove, onClick }) => {
    // Memoize button text
    const buttonText = useMemo(
      () => (media.length > 0 ? "Add more media" : "Click to select media"),
      [media.length]
    );

    // Filter ONLY valid media items
    const validMedia = useMemo(
      () => media.filter(isValidMediaSource),
      [media]
    );

    // Memoize media items
    const mediaItems = useMemo(
      () =>
        validMedia.map((item) => (
          <MediaPreviewItem key={item.id} item={item} onRemove={onRemove} />
        )),
      [validMedia, onRemove]
    );

    return (
      <div className="space-y-3">
        {/* Add Button */}
        <button
          type="button"
          onClick={onClick}
          className="flex items-center justify-center w-full h-24 border-2 border-gray-5/20 border-dashed rounded-lg cursor-pointer hover:border-gray-5/40 transition-colors bg-gray-5/5"
        >
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-gray-4" />
            <span className="text-sm text-gray-4 font-sofia-sans">
              {buttonText}
            </span>
          </div>
        </button>

        {/* Selected Media */}
        {mediaItems.length > 0 && (
          <div className="grid grid-cols-6 gap-3">{mediaItems}</div>
        )}
      </div>
    );
  }
);

MultipleMediaPreview.displayName = "MultipleMediaPreview";

// ============================================
// MEDIA PREVIEW ITEM
// ============================================

interface MediaPreviewItemProps {
  item: MediaItem;
  onRemove: (id: string) => void;
}

const MediaPreviewItem = React.memo<MediaPreviewItemProps>(
  ({ item, onRemove }) => {
    const handleRemove = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onRemove(item.id);
      },
      [item.id, onRemove]
    );

    // Get source - support both 'src' and 'url'
    const mediaSrc = useMemo(() => {
      const src = item.src || item.url;
      // CRITICAL: Return null if invalid
      if (!src || typeof src !== "string" || src.trim() === "") {
        return null;
      }
      return src.trim();
    }, [item]);

    const isImage = useMemo(
      () => item.type === "image" || item.type === "vector",
      [item.type]
    );

    // CRITICAL: Don't render if no valid source
    if (!mediaSrc) {
      return null;
    }

    return (
      <div className="relative aspect-square border-2 border-gray-5/20 rounded-lg overflow-hidden group bg-gray-5/5">
        {isImage ? (
          <Image
            src={mediaSrc}
            alt={item.alt || "Selected media"}
            fill
            className="object-cover"
            sizes="200px"
            onError={(e) => {
              console.error("Image failed to load:", mediaSrc);
              e.currentTarget.style.display = "none";
            }}
          />
        ) : item.type === "video" ? (
          <video
            src={mediaSrc}
            controls={false}
            className="w-full h-full object-cover bg-black"
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-5/10">
            <div className="text-center">
              {item.type === "document" && (
                <File className="w-6 h-6 mx-auto mb-1 text-gray-4" />
              )}
              {item.type === "audio" && (
                <Music className="w-6 h-6 mx-auto mb-1 text-gray-4" />
              )}
              <p className="text-xs text-gray-4 font-sofia-sans capitalize">
                {item.type || "file"}
              </p>
            </div>
          </div>
        )}

        {/* Remove Button */}
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }
);

MediaPreviewItem.displayName = "MediaPreviewItem";

export default MultipleMediaPreview;