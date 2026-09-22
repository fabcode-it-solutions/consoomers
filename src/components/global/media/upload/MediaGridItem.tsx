import React, { useCallback, useMemo } from "react";
import { MediaItem } from "@/types/media.types";
import { MediaPreview } from "./MediaPreview";
import { formatBytes } from "@/utils/formatBytes";
import {
  Eye,
  Trash2,
  Download,
  EyeOff,
  AlertTriangle,
  Check,
} from "lucide-react";

interface MediaGridItemProps {
  item: MediaItem;
  isSelected: boolean;
  selectable: boolean;
  onSelect: (id: string, e: React.MouseEvent) => void;
  onView: (item: MediaItem) => void;
  onDownload: (item: MediaItem, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

const MediaGridItem = React.memo<MediaGridItemProps>(
  ({
    item,
    isSelected,
    selectable,
    onSelect,
    onView,
    onDownload,
    onDelete,
  }) => {
    // Memoize click handlers
    const handleSelect = useCallback(
      (e: React.MouseEvent) => {
        onSelect(item.id, e);
      },
      [item.id, onSelect]
    );

    const handleView = useCallback(() => {
      onView(item);
    }, [item, onView]);

    const handleDownload = useCallback(
      (e: React.MouseEvent) => {
        onDownload(item, e);
      },
      [item, onDownload]
    );

    const handleDelete = useCallback(
      (e: React.MouseEvent) => {
        onDelete(item.id, e);
      },
      [item.id, onDelete]
    );

    // Memoize container classes
    const containerClasses = useMemo(
      () =>
        `group relative aspect-square bg-gray-5/5  border overflow-hidden cursor-pointer transition-all duration-200 hover:border-accent-100/50 hover:shadow-lg ${
          isSelected
            ? "border-accent-100 ring-2 ring-accent-100/20"
            : "border-gray-5/20"
        }`,
      [isSelected]
    );

    // Memoize checkbox classes
    const checkboxClasses = useMemo(
      () =>
        `w-5 h-5  border-2 flex items-center justify-center transition-colors ${
          isSelected
            ? "bg-blue-100 border-accent-100"
            : "bg-white/90 border-gray-300 hover:border-accent-100"
        }`,
      [isSelected]
    );

    // Memoize status indicators
    const statusIndicators = useMemo(
      () => (
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          {!item.isPublic && (
            <div className="w-6 h-6 bg-red-500/80  flex items-center justify-center">
              <EyeOff className="w-3 h-3 text-white" />
            </div>
          )}
          {item.isArchived && (
            <div className="w-6 h-6 bg-yellow-500/80 flex items-center justify-center">
              <AlertTriangle className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      ),
      [item.isPublic, item.isArchived]
    );

    // Memoize file info
    const fileInfo = useMemo(
      () => ({
        name: item.name || item.alt || "Untitled",
        size: item.size,
        alt: item.alt,
      }),
      [item.name, item.altText, item.size]
    );

    return (
      <div className={containerClasses} onClick={handleView}>
        {/* Selection Checkbox */}
        {selectable && (
          <div className="absolute top-1 left-1 z-10">
            <button
              type="button"
              onClick={handleSelect}
              className={checkboxClasses}
            >
              {isSelected && <Check className="w-3 h-3 text-white" />}
            </button>
          </div>
        )}

        {/* Status Indicators */}
        {statusIndicators}

        {/* Media Preview */}
        <div className="w-full h-full">
          <MediaPreview item={item} showOverlay />
        </div>

        {/* Overlay with Actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex gap-2">
            <button
              onClick={handleView}
              className="p-2 bg-white/20 hover:bg-white/30  cursor-pointer  transition-colors"
              title="View details"
            >
              <Eye className="w-4 h-4 text-white" />
            </button>

            <button
              onClick={handleDownload}
              className="p-2 bg-white/20 hover:bg-white/30  cursor-pointer  transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4 text-white" />
            </button>

            <button
              onClick={handleDelete}
              className="p-2 bg-red-500/60 hover:bg-red-500/80 cursor-pointer  transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Media Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="text-white">
            <p className="text-sm font-medium font-sofia-sans truncate">
              {fileInfo.name || fileInfo.alt}
            </p>
            <div className="flex items-center justify-between text-xs text-white/80 font-sofia-sans">
              <span className="capitalize">{item.type}</span>
              {fileInfo.size && <span>{fileInfo.size}</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

MediaGridItem.displayName = "MediaGridItem";

export default MediaGridItem;
