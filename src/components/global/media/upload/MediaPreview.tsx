"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Archive,
  File,
} from "lucide-react";
import { MediaItem, MediaType } from "@/types/media.types";
import { Media } from "@/db/type";

interface MediaPreviewProps {
  item: Media;
  className?: string;
  onClick?: () => void;
  showOverlay?: boolean;
}

export const MediaPreview = React.memo<MediaPreviewProps>(
  ({ item, className = "", onClick, showOverlay = false }) => {
    const isImage = useMemo(
      () => item.type === "image" || item.type === "vector",
      [item.type]
    );
    const isVideo = useMemo(() => item.type === "video", [item.type]);

    // Memoize overlay JSX
    const overlayElement = useMemo(
      () =>
        showOverlay ? (
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity" />
        ) : null,
      [showOverlay]
    );

    if (isImage) {
      return (
        <div
          className={`relative w-full h-full overflow-hidden ${className}`}
          onClick={onClick}
        >
          <Image
            src={item.src}
            alt={item.alt || "Media"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
          {overlayElement}
        </div>
      );
    }

    if (isVideo) {
      return (
        <div
          className={`relative w-full h-full bg-gray-5/10 flex items-center justify-center ${className}`}
          onClick={onClick}
        >
          <Video className="w-8 h-8 text-gray-4" />
          {showOverlay && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className={`w-full h-full bg-gray-5/10 flex items-center justify-center ${className}`}
        onClick={onClick}
      >
        <MediaTypeIcon type={item.type as MediaType} />
      </div>
    );
  }
);

MediaPreview.displayName = "MediaPreview";

// ============================================
// MEDIA TYPE ICON
// ============================================

interface MediaTypeIconProps {
  type: MediaType;
  className?: string;
}

export const MediaTypeIcon = React.memo<MediaTypeIconProps>(
  ({ type, className = "w-6 h-6" }) => {
    const iconElement = useMemo(() => {
      switch (type) {
        case "image":
        case "vector":
          return <ImageIcon className={`${className} text-blue-400`} />;
        case "video":
          return <Video className={`${className} text-purple-400`} />;
        case "audio":
          return <Music className={`${className} text-green-400`} />;
        case "archive":
          return <Archive className={`${className} text-yellow-400`} />;
        case "document":
        case "spreadsheet":
        case "presentation":
          return <FileText className={`${className} text-gray-4`} />;
        default:
          return <File className={`${className} text-gray-4`} />;
      }
    }, [type, className]);

    return iconElement;
  }
);

MediaTypeIcon.displayName = "MediaTypeIcon";
