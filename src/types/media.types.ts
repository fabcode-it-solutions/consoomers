// ============================================
// CONSOLIDATED MEDIA TYPES
// ============================================

import { Media } from "@/db/type";

export type MediaType =
  | "image"
  | "video"
  | "document"
  | "audio"
  | "archive"
  | "vector"
  | "spreadsheet"
  | "presentation"
  | "all";

export interface MediaItem extends Media {
  type: MediaType;
  url: string;
  altText?: string;
  filename?: string;
  mimeType?: string;
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

export interface MediaUploadConfig {
  accept?: string;
  maxFiles?: number;
  minFiles?:number;
  maxSize?: number; // in MB
  allowedTypes?: MediaType[];
  requiredDimensions?: { width: number; height: number };
  folder?: string;
}

export interface UploadProgress {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  preview?: string;
  result?: Media;
}

export interface MediaSelectorProps {
  mode?: "single" | "multiple";
  selectedIds?: number[];
  onSelect: (media: MediaItem[]) => void;
  config?: MediaUploadConfig;
}

export interface MediaGridProps {
  items: MediaItem[];
  selectedIds?: number[];
  onSelect?: (id: string) => void;
  onView?: (item: MediaItem) => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
  selectable?: boolean;
}

export interface MediaPreviewProps {
  item: MediaItem;
  className?: string;
  onClick?: () => void;
}

// ============================================
// CONSTANTS
// ============================================

export const MEDIA_TYPE_CONFIG: Record<
  MediaType,
  {
    label: string;
    icon: string;
    accept: string;
    maxSize: number;
  }
> = {
  image: {
    label: "Images",
    icon: "Image",
    accept: "image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml",
    maxSize: 10,
  },
  video: {
    label: "Videos",
    icon: "Video",
    accept: "video/mp4,video/webm,video/ogg",
    maxSize: 100,
  },
  document: {
    label: "Documents",
    icon: "FileText",
    accept: "application/pdf,.doc,.docx,.txt",
    maxSize: 50,
  },
  spreadsheet: {
    label: "Spreadsheets",
    icon: "Table",
    accept: ".xls,.xlsx,.csv",
    maxSize: 25,
  },
  presentation: {
    label: "Presentations",
    icon: "Presentation",
    accept: ".ppt,.pptx",
    maxSize: 50,
  },
  audio: {
    label: "Audio",
    icon: "Music",
    accept: "audio/mpeg,audio/wav,audio/ogg",
    maxSize: 25,
  },
  archive: {
    label: "Archives",
    icon: "Archive",
    accept: ".zip,.rar,.7z,.tar,.gz",
    maxSize: 100,
  },
  vector: {
    label: "Vector Graphics",
    icon: "Image",
    accept: "image/svg+xml,.ai,.eps",
    maxSize: 5,
  },
    all: {
    label: "All Media",
    icon: "Folder",
    accept: "*/*",
    maxSize: 100,
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getMediaTypeFromMime = (mimeType: string): MediaType => {
  if (mimeType.startsWith("image/svg")) return "vector";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (
    mimeType.includes("pdf") ||
    mimeType.includes("document") ||
    mimeType.includes("text")
  )
    return "document";
  if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("csv") ||
    mimeType.includes("excel")
  )
    return "spreadsheet";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return "presentation";
  if (
    mimeType.includes("zip") ||
    mimeType.includes("rar") ||
    mimeType.includes("compressed")
  )
    return "archive";
  return "document";
};

export const getMediaTypeFromFile = (file: File): MediaType => {
  return getMediaTypeFromMime(file.type);
};

export const isPreviewable = (type: MediaType): boolean => {
  return ["image", "video", "vector"].includes(type);
};

export const validateFile = (
  file: File,
  config: MediaUploadConfig
): { valid: boolean; error?: string } => {
  const mediaType = getMediaTypeFromFile(file);
  const typeConfig = MEDIA_TYPE_CONFIG[mediaType];

  // Check file size
  const maxSizeBytes = (config.maxSize || typeConfig.maxSize) * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${
        config.maxSize || typeConfig.maxSize
      }MB`,
    };
  }

  // Check allowed types
  if (config.allowedTypes && !config.allowedTypes.includes(mediaType)) {
    return {
      valid: false,
      error: `File type ${mediaType} is not allowed`,
    };
  }

  return { valid: true };
};

export const createFilePreview = (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    const mediaType = getMediaTypeFromFile(file);

    if (!isPreviewable(mediaType)) {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};
