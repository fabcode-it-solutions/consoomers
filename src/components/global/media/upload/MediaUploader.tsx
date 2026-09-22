"use client";

import React, { useCallback, useState, useId, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import {
  MediaUploadConfig,
  UploadProgress,
  MediaItem,
  validateFile,
  createFilePreview,
  MEDIA_TYPE_CONFIG,
  getMediaTypeFromFile,
} from "@/types/media.types";
import { uploadFile } from "@/utils/uploadFile";
import UploadItem from "./UploadItem";
import { getFileMetadata, FileMetadata } from "@/utils/getFileMetaData";

interface MediaUploaderProps {
  mode?: "single" | "multiple";
  config?: MediaUploadConfig;
  onUploadComplete: (media: MediaItem[]) => void;
  onUploadError?: (errors: string[]) => void;
  className?: string;
  userId: string;
}

export const MediaUploader = React.memo<MediaUploaderProps>(
  ({
    mode = "single",
    config = {},
    onUploadComplete,
    onUploadError,
    className = "",
    userId,
  }) => {
    const uploadId = useId();
    const [uploads, setUploads] = useState<UploadProgress[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    // Memoize default config
    const defaultConfig: MediaUploadConfig = useMemo(
      () => ({
        maxFiles: mode === "single" ? 1 : 10,
        maxSize: 50,
        folder: "/media",
        ...config,
      }),
      [mode, config]
    );

    // Memoize accepted types string
    const acceptedTypes = useMemo(
      () =>
        defaultConfig.allowedTypes
          ? defaultConfig.allowedTypes
              .map((t) => MEDIA_TYPE_CONFIG[t].accept)
              .join(",")
          : "*/*",
      [defaultConfig.allowedTypes]
    );

    // Memoize type labels for display
    const typeLabels = useMemo(
      () =>
        defaultConfig.allowedTypes
          ? defaultConfig.allowedTypes
              .map((t) => MEDIA_TYPE_CONFIG[t].label)
              .join(", ")
          : "Any file type",
      [defaultConfig.allowedTypes]
    );

    const onDrop = useCallback(
      async (acceptedFiles: File[]) => {
        // Validate files
        const validatedFiles: UploadProgress[] = [];
        const errors: string[] = [];

        for (const file of acceptedFiles) {
          const validation = validateFile(file, defaultConfig);

          if (validation.valid) {
            const preview = await createFilePreview(file);
            validatedFiles.push({
              id: `${uploadId}-${Date.now()}-${Math.random()}`,
              file,
              progress: 0,
              status: "pending",
              preview: preview || undefined,
            });
          } else {
            errors.push(`${file.name}: ${validation.error}`);
          }
        }

        if (errors.length > 0 && onUploadError) {
          onUploadError(errors);
        }

        if (validatedFiles.length > 0) {
          // Single mode: replace existing
          if (mode === "single") {
            setUploads(validatedFiles);
          } else {
            setUploads((prev) => [...prev, ...validatedFiles]);
          }
        }
      },
      [defaultConfig, mode, onUploadError, uploadId]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: { [acceptedTypes]: [] },
      maxFiles: defaultConfig.maxFiles,
      maxSize: defaultConfig.maxSize! * 1024 * 1024,
      disabled: isUploading,
    });

    const removeUpload = useCallback((id: string) => {
      setUploads((prev) => prev.filter((u) => u.id !== id));
    }, []);

    const clearAll = useCallback(() => {
      setUploads([]);
    }, []);

    const uploadFiles = useCallback(async () => {
      if (uploads.length === 0) return;

      setIsUploading(true);
      const results: MediaItem[] = [];
      const errors: string[] = [];

      for (const upload of uploads) {
        try {
          // Update status to uploading
          setUploads((prev) =>
            prev.map((u) =>
              u.id === upload.id
                ? { ...u, status: "uploading", progress: 0 }
                : u
            )
          );

          const mediaType = getMediaTypeFromFile(upload.file);
          const fileMetadata = (await getFileMetadata(
            upload.file
          )) as FileMetadata;
          if (fileMetadata) {
            const metadata = {
              width: fileMetadata.width || 0,
              height: fileMetadata.height || 0,
              size: fileMetadata.sizeFormatted,
              format: fileMetadata.format,
            };
            const result = await uploadFile({
              file: upload.file,
              folder: defaultConfig.folder!,
              type: mediaType,
              userId,
              alt: upload.file.name,
              metadata,
            });

            if (result.media?.media) {
              const uploadedMedia = result.media.media;

              // Update status to success
              setUploads((prev) =>
                prev.map((u) =>
                  u.id === upload.id
                    ? {
                        ...u,
                        status: "success",
                        progress: 100,
                        result: uploadedMedia,
                      }
                    : u
                )
              );

              results.push(uploadedMedia);
            }
          } else {
            throw new Error("Upload failed");
          }
        } catch (error) {
          console.log(error);
          const errorMessage =
            error instanceof Error ? error.message : "Upload failed";
          errors.push(`${upload.file.name}: ${errorMessage}`);

          // Update status to error
          setUploads((prev) =>
            prev.map((u) =>
              u.id === upload.id
                ? { ...u, status: "error", error: errorMessage }
                : u
            )
          );
        }
      }

      setIsUploading(false);

      if (results.length > 0) {
        onUploadComplete(results);
      }

      if (errors.length > 0 && onUploadError) {
        onUploadError(errors);
      }
    }, [
      uploads,
      defaultConfig.folder,
      userId,
      onUploadComplete,
      onUploadError,
    ]);

    // Memoize canUpload flag
    const canUpload = useMemo(
      () => uploads.length > 0 && uploads.some((u) => u.status === "pending"),
      [uploads]
    );

    // Memoize dropzone classes
    const dropzoneClasses = useMemo(
      () =>
        `relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? "border-accent-100 bg-blue-100/10"
            : "border-gray-5/20 hover:border-gray-5/40 bg-gray-5/5"
        } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`,
      [isDragActive, isUploading]
    );

    // Memoize upload items
    const uploadItems = useMemo(
      () =>
        uploads.map((upload) => (
          <UploadItem
            key={upload.id}
            upload={upload}
            onRemove={() => removeUpload(upload.id)}
            disabled={isUploading}
          />
        )),
      [uploads, removeUpload, isUploading]
    );

    return (
      <div className={`space-y-4 ${className}`}>
        {/* Dropzone */}
        <div {...getRootProps()} className={dropzoneClasses}>
          <input {...getInputProps()} />

          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto bg-blue-100/20 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-accent-100" />
            </div>

            <div>
              <p className="text-sm font-medium text-light-100 font-sofia-sans">
                {isDragActive
                  ? "Drop files here"
                  : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-gray-4 mt-1 font-sofia-sans">
                {typeLabels}
              </p>
              <p className="text-xs text-gray-5 mt-1 font-sofia-sans">
                Max {defaultConfig.maxFiles} file
                {defaultConfig.maxFiles! > 1 ? "s" : ""}, up to{" "}
                {defaultConfig.maxSize}MB each
              </p>
            </div>
          </div>
        </div>

        {/* Upload List */}
        {uploads.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-light-100 font-sofia-sans">
                Files ({uploads.length})
              </h4>
              <div className="flex gap-2">
                {canUpload && (
                  <button
                    type="button"
                    onClick={uploadFiles}
                    disabled={isUploading}
                    className="px-3 py-1 bg-blue-100 text-white rounded text-xs font-sofia-sans font-medium hover:bg-blue-100/90 transition-colors disabled:opacity-50"
                  >
                    {isUploading ? "Uploading..." : "Upload All"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={isUploading}
                  className="px-3 py-1 bg-gray-5/20 text-gray-4 rounded text-xs font-sofia-sans hover:bg-gray-5/30 transition-colors disabled:opacity-50"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {uploadItems}
            </div>
          </div>
        )}
      </div>
    );
  }
);

MediaUploader.displayName = "MediaUploader";
