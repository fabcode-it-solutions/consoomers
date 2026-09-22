import React, { useMemo, useCallback } from "react";
import { formatFileSize, UploadProgress } from "@/types/media.types";
import { AlertCircle, CheckCircle, File, Loader2, X } from "lucide-react";
import Image from "next/image";

interface UploadItemProps {
  upload: UploadProgress;
  onRemove: () => void;
  disabled: boolean;
}

const UploadItem = React.memo<UploadItemProps>(
  ({ upload, onRemove, disabled }) => {
    // Memoize status icon
    const statusIcon = useMemo(() => {
      switch (upload.status) {
        case "uploading":
          return <Loader2 className="w-4 h-4 text-accent-100 animate-spin" />;
        case "success":
          return <CheckCircle className="w-4 h-4 text-green-400" />;
        case "error":
          return <AlertCircle className="w-4 h-4 text-red-400" />;
        default:
          return <File className="w-4 h-4 text-gray-4" />;
      }
    }, [upload.status]);

    // Memoize formatted file size
    const formattedSize = useMemo(
      () => formatFileSize(upload.file.size),
      [upload.file.size]
    );

    // Memoize progress bar style
    const progressStyle = useMemo(
      () => ({ width: `${upload.progress}%` }),
      [upload.progress]
    );

    // Memoize handleRemove to prevent recreation
    const handleRemove = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onRemove();
      },
      [onRemove]
    );

    return (
      <div className="flex items-center gap-3 p-3 bg-gray-5/5 border border-gray-5/20 rounded-lg">
        {/* Preview */}
        {upload.preview ? (
          <Image
            src={upload.preview}
            alt={upload.file.name}
            className="w-12 h-12 object-cover rounded"
            width={48}
            height={48}
          />
        ) : (
          <div className="w-12 h-12 bg-gray-5/10 rounded flex items-center justify-center">
            <File className="w-6 h-6 text-gray-4" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-light-100 font-sofia-sans truncate">
              {upload.file.name}
            </p>
            {statusIcon}
          </div>
          <p className="text-xs text-gray-4 font-sofia-sans">{formattedSize}</p>

          {/* Progress Bar */}
          {upload.status === "uploading" && (
            <div className="mt-2 w-full bg-gray-5/20 rounded-full h-1">
              <div
                className="bg-blue-100 h-1 rounded-full transition-all"
                style={progressStyle}
              />
            </div>
          )}

          {/* Error */}
          {upload.status === "error" && upload.error && (
            <p className="text-xs text-red-400 font-sofia-sans mt-1">
              {upload.error}
            </p>
          )}
        </div>

        {/* Remove */}
        <button
          type="button"
          onClick={handleRemove}
          disabled={disabled}
          className="p-1 text-gray-4 hover:text-red-400 transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }
);

UploadItem.displayName = "UploadItem";

export default UploadItem;
