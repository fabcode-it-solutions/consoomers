import { MediaItem, MediaType } from "@/types/media.types";

export interface MediaUploadData {
  entityType?: string;
  entityId?: number;
  altText?: string;
  isPublic?: boolean;
  displayOrder?: number;
}

export interface CreateMediaItem extends MediaUploadData {
  file: File;
}

export interface UpdateMediaItem {
  id: number;
  altText?: string;
  isPublic?: boolean;
  displayOrder?: number;
  isArchived?: boolean;
}

export interface MediaFilters {
  search: string;
  type: string;
  entityType: string;
  isPublic: string;
  isArchived: string;
  dateRange: string;
  userId: string;
}

export interface MediaSortConfig {
  field: keyof MediaItem | "size" | "filename";
  direction: "asc" | "desc";
}

export interface MediaApiResponse<T = MediaItem[]> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BulkMediaOperation {
  action: "delete" | "archive" | "unarchive" | "makePublic" | "makePrivate";
  mediaIds: number[];
}

export interface MediaStats {
  total: number;
  byType: Record<MediaType, number>;
  totalSize: number;
  archivedCount: number;
  publicCount: number;
}

// Form-related types
export interface MediaViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem;
  onUpdate?: (updatedMedia: MediaItem) => void;
  onDelete?: (mediaId: string) => void;
}

export interface MediaGridProps {
  media: MediaItem[];
  selectedMedia: number[];
  onMediaSelect: (mediaId: number) => void;
  onMediaView: (media: MediaItem) => void;
  onMediaDelete: (mediaId: number) => void;
  loading?: boolean;
  viewMode?: string;
}

export interface MediaUploadAreaProps {
  onFilesUpload: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
  loading?: boolean;
  className?: string;
}

// Constants
export const MEDIA_TYPES: {
  value: MediaType;
  label: string;
  icon: string;
  accept: string;
}[] = [
  { value: "image", label: "Images", icon: "Image", accept: "image/*" },
  { value: "video", label: "Videos", icon: "Video", accept: "video/*" },
  {
    value: "document",
    label: "Documents",
    icon: "FileText",
    accept: ".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv",
  },
];

export const ENTITY_TYPES = [
  { value: "All", label: "All Entities" },
  { value: "part", label: "Parts" },
  { value: "category", label: "Categories" },
  { value: "user", label: "Users" },
  { value: "page", label: "Pages" },
  { value: "banner", label: "Banners" },
  { value: "shop", label: "Shop" },
];

export const DATE_RANGES = [
  { value: "All", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
];

// Utility functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getMediaTypeFromMimeType = (mimeType: string): MediaType => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.includes("pdf") || mimeType.includes("document"))
    return "document";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return "spreadsheet";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return "presentation";
  if (
    mimeType.includes("zip") ||
    mimeType.includes("rar") ||
    mimeType.includes("tar")
  )
    return "archive";
  if (mimeType.includes("svg")) return "vector";
  return "document";
};

export const isImageType = (mediaType: MediaType): boolean => {
  return mediaType === "image" || mediaType === "vector";
};

export const isVideoType = (mediaType: MediaType): boolean => {
  return mediaType === "video";
};
