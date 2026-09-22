/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import {
  Search,
  Image as ImageIcon,
  Music,
  File,
  VideoIcon,
  Grid2X2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useApiRequest } from "@/hooks/useApiRequest";
import { MediaItem, MediaType, MediaUploadConfig } from "@/types/media.types";
import { MediaGrid } from "./MediaGrid";
import Pagination from "@/components/ui/Pagination";
import InputField from "@/components/ui/InputField";
import DeleteConfirmationDialog from "@/components/ui/DeleteConfirmationDialog";
import mediaService from "@/services/media.service";
import MediaViewModal from "../MediaViewModal";

// Lazy load MediaUploader for code splitting
const MediaUploader = React.lazy(() =>
  import("./MediaUploader").then((module) => ({
    default: module.MediaUploader,
  }))
);

interface MediaSelectorProps {
  mode?: "single" | "multiple";
  selectedIds?: string[];
  onSelect: (media: MediaItem[]) => void;
  onCancel: () => void;
  config?: MediaUploadConfig;
  userId: string;
}

export const MediaSelector = React.memo<MediaSelectorProps>(
  ({
    mode = "single",
    selectedIds = [],
    onSelect,
    onCancel,
    config = {},
    userId,
  }) => {
    const [type, setType] = useState<MediaType>("all");
    const [activeTab, setActiveTab] = useState<"upload" | "library">("library");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectDeleteId, setSelectDeleteId] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [selectedMediaItem, setSelectedMediaItem] =
      useState<MediaItem | null>(null);
    const [selectedMediaIds, setSelectedMediaIds] =
      useState<string[]>(selectedIds);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
      totalPages: 1,
      totalItems: 0,
      hasNext: false,
      hasPrev: false,
      itemsPerPage: 48,
    });

    const { request: fetchMedia, loading: fetchLoading } = useApiRequest<{
      success: boolean;
      data?: MediaItem[];
      pagination?: {
        totalPages: number;
        total: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
      error?: string;
    }>();

    // Memoize allowed types string
    const allowedTypesParam = useMemo(
      () => (config.allowedTypes ? config.allowedTypes.join(",") : null),
      [config.allowedTypes]
    );

    const loadMedia = useCallback(async () => {
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: pagination.itemsPerPage.toString(),
          userId: userId,
        });

        if (searchTerm) {
          params.append("search", searchTerm);
        }

        if (allowedTypesParam) {
          params.append("type", type);
        }

        const result = await fetchMedia({
          url: `/api/media?${params.toString()}`,
          options: {
            method: "GET",
            next: { tags: ["media-list"], revalidate: 300 },
          },
        });

        if (result?.success && Array.isArray(result.data)) {
          setMediaItems(result.data);
          if (result.pagination) {
            setPagination((prev) => ({
              ...prev,
              totalPages: result.pagination!.totalPages,
              totalItems: result.pagination!.total,
              hasNext: result.pagination!.hasNext,
              hasPrev: result.pagination!.hasPrev,
            }));
          }
        } else {
          toast.error(result?.error || "Failed to fetch media");
        }
      } catch (error) {
        console.error("Error fetching media:", error);
        toast.error("Failed to fetch media");
      }
    }, [
      currentPage,
      pagination.itemsPerPage,
      searchTerm,
      userId,
      allowedTypesParam,
      fetchMedia,
    ]);

    useEffect(() => {
      if (activeTab === "library") {
        loadMedia();
      }
    }, [activeTab, currentPage, searchTerm, type]);

    const handleMediaSelect = useCallback(
      (id: string) => {
        if (mode === "single") {
          setSelectedMediaIds([id]);
        } else {
          setSelectedMediaIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
          );
        }
      },
      [mode]
    );

    const handleUploadComplete = useCallback(
      (uploadedMedia: MediaItem[]) => {
        toast.success(`${uploadedMedia.length} file(s) uploaded successfully`);
        setActiveTab("library");
        loadMedia();

        // Auto-select uploaded items
        const uploadedIds = uploadedMedia.map((m) => m.id);
        if (mode === "single") {
          setSelectedMediaIds([uploadedIds[0]]);
        } else {
          setSelectedMediaIds((prev) => [...prev, ...uploadedIds]);
        }
      },
      [mode, loadMedia]
    );

    const handleUploadError = useCallback((errors: string[]) => {
      errors.forEach((error) => toast.error(error));
    }, []);

    const handleConfirm = useCallback(() => {
      const selectedMedia = mediaItems.filter((item) =>
        selectedMediaIds.includes(item.id)
      );
      onSelect(selectedMedia);
    }, [mediaItems, selectedMediaIds, onSelect]);

    const handleSearch = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
      },
      []
    );

    const handleTabChange = useCallback((tab: "upload" | "library") => {
      setActiveTab(tab);
    }, []);

    // Memoize tab button classes
    const getTabClasses = useCallback(
      (tab: "upload" | "library") =>
        `px-4 py-2  cursor-pointer font-sofia-sans font-medium transition-colors ${
          activeTab === tab
            ? "bg-blue-100 text-white"
            : "bg-gray-5/10 text-black hover:text-light-100"
        }`,
      [activeTab]
    );

    // Memoize selection text
    const selectionText = useMemo(
      () =>
        selectedMediaIds.length > 0
          ? `${selectedMediaIds.length} file${
              selectedMediaIds.length > 1 ? "s" : ""
            } selected`
          : "No files selected",
      [selectedMediaIds.length]
    );
    const handleDelete = useCallback(async () => {
      setDeleteLoading(true);
      try {
        await mediaService.deleteMediaById(selectDeleteId);
        loadMedia();
        setSelectDeleteId("");
      } catch (error) {
        console.error("Error deleting media:", error);
        toast.error("Failed to delete media");
      } finally {
        setDeleteLoading(false);
      }
    }, [selectDeleteId]);
    return (
      <div className="flex flex-col h-full max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleTabChange("library")}
              className={getTabClasses("library")}
            >
              Media Library
            </button>
            <button
              onClick={() => handleTabChange("upload")}
              className={getTabClasses("upload")}
            >
              Upload New
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "upload" ? (
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin w-8 h-8 border-4 border-accent-100 border-t-transparent" />
                </div>
              }
            >
              <MediaUploader
                mode={mode}
                config={config}
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                userId={userId}
              />
            </Suspense>
          ) : (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative p-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-4" />

                <InputField
                  type="text"
                  placeholder="Search media files..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-3 p-1">
                {["all", "image", "video", "document", "audio"].map(
                  (item, index) => (
                    <button
                      onClick={() => setType(item as MediaType)}
                      className={`flex items-center border-b gap-1 cursor-pointer capitalize ${
                        item == type ? " border-black" : "border-transparent"
                      }`}
                      key={`${item}-index-${index}`}
                    >
                      {item == "all" && <Grid2X2 className="w-4 h-4" />}
                      {item == "image" && <ImageIcon className="w-4 h-4" />}
                      {item == "video" && <VideoIcon className="w-4 h-4" />}
                      {item == "document" && <File className="w-4 h-4" />}
                      {item == "audio" && <Music className="w-4 h-4" />}
                      {item}
                    </button>
                  )
                )}
              </div>
              {/* Grid */}
              <div className="p-1">
                <MediaGrid
                  type={type}
                  items={mediaItems}
                  selectedIds={selectedMediaIds}
                  onSelect={handleMediaSelect}
                  onView={(item) => setSelectedMediaItem(item)}
                  loading={fetchLoading}
                  onDelete={(id) => setSelectDeleteId(id)}
                  selectable
                  columns={8}
                  emptyMessage="No media files found. Upload some files to get started."
                />
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalItems}
                  itemsPerPage={pagination.itemsPerPage}
                  hasNext={pagination.hasNext}
                  hasPrev={pagination.hasPrev}
                  setCurrentPage={setCurrentPage}
                />
              )}
            </div>
          )}
        </div>
        {selectDeleteId && (
          <DeleteConfirmationDialog
            confirmDelete={() => handleDelete()}
            deleteId={selectDeleteId}
            actionLabel={deleteLoading ? "Deleting" : "Delete"}
            deleteLoading={deleteLoading}
            setDelete={() => setSelectDeleteId("")}
            heading="Delete Media"
            content="Are you sure you want to delete this media? This action cannot
                        be undone."
          />
        )}
        {selectedMediaItem && (
          <MediaViewModal
            isOpen={selectedMediaItem.id ? true : false}
            onClose={() => setSelectedMediaItem(null)}
            media={selectedMediaItem}
          />
        )}
        {/* Footer */}
        {activeTab != "upload" && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-5/20">
            <p className="text-sm text-gray-4 font-sofia-sans">
              {selectionText}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-5/20  hover:bg-gray-5/10 font-sofia-sans text-light-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={selectedMediaIds.length === 0}
                className="px-4 py-2 bg-blue-100 text-white  hover:bg-blue-100/90 disabled:opacity-50 font-sofia-sans font-medium"
              >
                Select{" "}
                {selectedMediaIds.length > 0 && `(${selectedMediaIds.length})`}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

MediaSelector.displayName = "MediaSelector";
