/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useCallback, useMemo, Suspense } from "react";
import { MediaItem, MediaUploadConfig } from "@/types/media.types";
import MultipleMediaPreview from "./MultipleMediaPreview";
import SingleMediaPreview from "./SingleMediaPreview";
import DialogPopup from "@/components/ui/DialogPopup";

const MediaSelector = React.lazy(() =>
  import("./MediaSelector").then((module) => ({
    default: module.MediaSelector,
  }))
);

interface MediaInputProps {
  label?: string;
  size?: string;
  required?: boolean;
  errorMessage?: string;
  mode?: "single" | "multiple";
  selectedMedia?: MediaItem[];
  onChange: (media: MediaItem[]) => void;
  config?: MediaUploadConfig;
  userId: string;
  className?: string;
  renderTrigger?: (onClick: () => void, preview?: string) => React.ReactNode;
}

// Helper function to validate media items
const isValidMediaSource = (media: any): boolean => {
  if (!media) return false;

  const src = media?.src || media?.url;

  // Must have a source
  if (!src) return false;

  // Must be string
  if (typeof src !== "string") return false;

  // Must not be empty after trim
  if (src.trim() === "") return false;

  return true;
};

export const MediaInput = React.memo<MediaInputProps>(
  ({
    label,
    size,
    required = false,
    mode = "single",
    selectedMedia = [],
    onChange,
    config = {},
    userId,
    className = "",
    errorMessage,
    renderTrigger,
  }) => {
    const [showSelector, setShowSelector] = useState(false);

    const handleSelect = useCallback(
      (media: MediaItem[]) => {
        // CRITICAL: Filter to ONLY valid media items
        const validMedia = media.filter(isValidMediaSource);

        console.log("Selected media count:", media.length);
        console.log("Valid media count:", validMedia.length);
        console.log("Valid media:", validMedia);

        onChange(validMedia);
        setShowSelector(false);
      },
      [onChange]
    );

    const handleRemove = useCallback(
      (id: string) => {
        const updated = selectedMedia.filter((m) => m.id !== id);
        onChange(updated);
      },
      [selectedMedia, onChange]
    );

    const openSelector = useCallback(() => setShowSelector(true), []);
    const closeSelector = useCallback(() => setShowSelector(false), []);

    // Memoize preview URL - ensure it's VALID
    const previewUrl = useMemo(() => {
      if (!selectedMedia || selectedMedia.length === 0) return undefined;

      if (isValidMediaSource(selectedMedia[0])) {
        return selectedMedia[0].src || selectedMedia[0].url;
      }

      return undefined;
    }, [selectedMedia]);

    // Memoize selected IDs
    const selectedIds = useMemo(
      () => selectedMedia.filter(isValidMediaSource).map((m) => m.id),
      [selectedMedia]
    );

    // Memoize dialog heading
    const dialogHeading = useMemo(
      () => `Select Media ${mode === "multiple" ? "(Multiple)" : ""}`,
      [mode]
    );

    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          {label && (
            <label className="block text-sm text-light-100 font-sofia-sans">
              {label} {required && <span className="text-red-400">*</span>}
            </label>
          )}

          {size && (
            <p className="text-sm text-red-400">
              Recommended Image size :{" "}
              <span className="text-md text-red-500">{size}</span> for best Quality .
            </p>
          )}
        </div>

        {/* Custom Trigger */}
        {renderTrigger ? (
          <div onClick={openSelector} className="cursor-pointer">
            {renderTrigger(openSelector, previewUrl)}
          </div>
        ) : (
          /* Default Upload Button */
          <>
            {mode === "single" ? (
              <SingleMediaPreview
                media={
                  selectedMedia &&
                  selectedMedia.length > 0 &&
                  isValidMediaSource(selectedMedia[0])
                    ? selectedMedia[0]
                    : undefined
                }
                onRemove={() => {
                  if (selectedMedia && selectedMedia.length > 0) {
                    handleRemove(selectedMedia[0].id);
                  }
                }}
                onClick={openSelector}
              />
            ) : (
              <MultipleMediaPreview
                media={selectedMedia || []}
                onRemove={handleRemove}
                onClick={openSelector}
              />
            )}
          </>
        )}

        {/* Selector Modal */}
        <DialogPopup
          heading={dialogHeading}
          mode="light"
          open={showSelector}
          setShowCreateModal={setShowSelector}
        >
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin w-8 h-8 border-4 border-accent-100 border-t-transparent rounded-full" />
              </div>
            }
          >
            <MediaSelector
              mode={mode}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onCancel={closeSelector}
              config={config}
              userId={userId}
            />
          </Suspense>
        </DialogPopup>

        {/* Error Message */}
        {errorMessage && (
          <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
        )}
      </div>
    );
  }
);

MediaInput.displayName = "MediaInput";
