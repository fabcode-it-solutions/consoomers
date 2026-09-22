"use client";

import React, { useCallback, useMemo } from "react";
import { MediaItem, MediaType } from "@/types/media.types";
import MediaGridItem from "./MediaGridItem";
import { MediaTypeIcon } from "./MediaPreview";
import { File, Grid2X2, ImageIcon, Music, VideoIcon } from "lucide-react";

interface MediaGridProps {
  items: MediaItem[];
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  onView?: (item: MediaItem) => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
  selectable?: boolean;
  columns?: number;
  emptyMessage?: string;
  type: MediaType;
}

export const MediaGrid = React.memo<MediaGridProps>(
  ({
    items,
    selectedIds = [],
    onSelect,
    onView,
    onDelete,
    loading = false,
    selectable = false,
    columns = 10,
    emptyMessage = "No media files found",
    type,
  }) => {
    // Memoize handlers to prevent unnecessary re-renders
    const handleDownload = useCallback(
      (item: MediaItem, e: React.MouseEvent) => {
        e.stopPropagation();
        const link = document.createElement("a");
        link.href = item.url;
        link.download = item.filename || "file";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      []
    );

    const handleDelete = useCallback(
      (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete) {
          onDelete(id);
        }
      },
      [onDelete]
    );

    const handleSelect = useCallback(
      (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (onSelect) {
          onSelect(id);
        }
      },
      [onSelect]
    );

    const handleView = useCallback(
      (item: MediaItem) => {
        if (onView) {
          onView(item);
        }
      },
      [onView]
    );

    // Memoize loading skeleton
    const loadingSkeleton = useMemo(
      () => (
        <div
          className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-${columns} gap-4`}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="aspect-square bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      ),
      [columns]
    );

    // Memoize empty state
    const emptyState = useMemo(
      () => (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-5/20  flex items-center justify-center mb-4">
            {type == "all" && <Grid2X2 className="w-4 h-4" />}
            {type == "image" && <ImageIcon className="w-8 h-8" />}
            {type == "video" && <VideoIcon className="w-8 h-8" />}
            {type == "document" && <File className="w-8 h-8" />}
            {type == "audio" && <Music className="w-8 h-8" />}
          </div>
          <h3 className="text-lg font-medium text-light-100 font-sofia-sans mb-2">
            No media files found
          </h3>
          <p className="text-gray-4 font-sofia-sans">{emptyMessage}</p>
        </div>
      ),
      [emptyMessage, type]
    );

    // Memoize grid items to prevent unnecessary re-renders
    const gridItems = useMemo(
      () =>
        items.map((item) => {
          const isSelected = selectedIds.includes(item.id);

          return (
            <MediaGridItem
              key={item.id}
              item={item}
              isSelected={isSelected}
              selectable={selectable}
              onSelect={handleSelect}
              onView={handleView}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />
          );
        }),
      [
        items,
        selectedIds,
        selectable,
        handleSelect,
        handleView,
        handleDownload,
        handleDelete,
      ]
    );

    // Loading state
    if (loading) {
      return loadingSkeleton;
    }

    // Empty state
    if (items.length === 0) {
      return emptyState;
    }

    return (
      <div
        className={`grid grid-cols-2  md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-${columns} gap-4`}
      >
        {gridItems}
      </div>
    );
  }
);

MediaGrid.displayName = "MediaGrid";
