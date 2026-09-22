"use client";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Switch from "@radix-ui/react-switch";
import {
  X,
  Trash2,
  Eye,
  EyeOff,
  Download,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertTriangle,
  Edit,
} from "lucide-react";

import { useApiRequest } from "@/hooks/useApiRequest";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  isImageType,
  isVideoType,
  MediaViewModalProps,
} from "@/db/type/media.type";
import InputField from "../../ui/InputField";
import { MediaItem } from "@/types/media.types";
import { formatDate } from "@/utils/default";

interface MediaApiResponse {
  success: boolean;
  data?: MediaItem;
  error?: string;
  message?: string;
}

const MediaViewModal: React.FC<MediaViewModalProps> = ({
  isOpen,
  onClose,
  media,
  onUpdate,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    altText: media.alt || "",
    isPublic: media.isPublic,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const { request: updateMedia, loading: updateLoading } =
    useApiRequest<MediaApiResponse>();
  const { request: deleteMedia, loading: deleteLoading } =
    useApiRequest<MediaApiResponse>();

  useEffect(() => {
    setFormData({
      altText: media.alt || "",
      isPublic: media.isPublic,
    });
    setIsEditing(false);
  }, [media]);

  const handleSave = async () => {
    try {
      const result = await updateMedia({
        url: `/api/media/${media.id}`,
        options: {
          method: "PATCH",
          body: formData,
        },
      });

      if (result?.success && result.data) {
        toast.success("Media updated successfully");
        if (onUpdate) {
          onUpdate(result.data);
        }
        setIsEditing(false);
      } else {
        toast.error(result?.error || "Failed to update media");
      }
    } catch (error) {
      console.error("Error updating media:", error);
      toast.error("Failed to update media");
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this media? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const result = await deleteMedia({
        url: `/api/media/${media.id}`,
        options: {
          method: "DELETE",
        },
      });

      if (result?.success) {
        toast.success("Media deleted successfully");
        if (onDelete) onDelete(media.id);
        onClose();
      } else {
        toast.error(result?.error || "Failed to delete media");
      }
    } catch (error) {
      console.error("Error deleting media:", error);
      toast.error("Failed to delete media");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(media.src);
      setCopied(true);
      toast.success("URL copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
      toast.error("Failed to copy URL");
    }
  };

  const downloadFile = () => {
    const link = document.createElement("a");
    link.href = media.src;
    link.download = media.filename || "file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderMediaPreview = () => {
    if (isImageType(media.type)) {
      return (
        <div className="relative bg-gray-5/5 rounded-lg overflow-hidden">
          <Image
            src={media.src}
            width={384}
            height={384}
            alt={media.alt || "Media preview"}
            className="w-full h-auto max-h-96 object-contain"
          />
        </div>
      );
    }

    if (isVideoType(media.type)) {
      return (
        <div className="relative bg-gray-5/5 rounded-lg overflow-hidden">
          <video
            src={media.src}
            controls
            className="w-full h-auto max-h-96 object-contain"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    // For other file types, show a preview placeholder
    return (
      <div className="bg-gray-5/5 rounded-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto bg-blue-100/20 rounded-lg flex items-center justify-center mb-4">
          <ExternalLink className="w-8 h-8 text-accent-100" />
        </div>
        <p className="text-sm text-gray-4 font-sofia-sans">
          Preview not available for this file type
        </p>
        <button
          onClick={() => window.open(media.src, "_blank")}
          className="mt-2 text-accent-100 hover:text-accent-100/80 text-sm font-sofia-sans"
        >
          Open in new tab
        </button>
      </div>
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />

        <AnimatePresence>
          <Dialog.Content asChild>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-5/20">
                <div className="flex items-center gap-3">
                  <Dialog.Title className="text-lg font-semibold text-light-100 font-sofia-sans">
                    View Media
                  </Dialog.Title>

                  <div className="flex items-center gap-2">
                    {media.isPublic ? (
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-white rounded text-xs font-sofia-sans">
                        <Eye className="w-3 h-3" />
                        Public
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-sofia-sans">
                        <EyeOff className="w-3 h-3" />
                        Private
                      </div>
                    )}
                    {media.isArchived && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-sofia-sans">
                        <AlertTriangle className="w-3 h-3" />
                        Archived
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadFile}
                    className="p-2 text-gray-4 hover:text-light-100 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {onUpdate && (
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="p-2 text-gray-4 hover:text-accent-100 transition-colors"
                      title={isEditing ? "Cancel" : "Edit"}
                    >
                      {isEditing ? (
                        <X className="w-4 h-4" />
                      ) : (
                        <Edit className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  <Dialog.Close asChild>
                    <button className="p-2 text-gray-4 hover:text-light-100 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </Dialog.Close>
                </div>
              </div>

              {/* Content */}
              <div className="flex h-[calc(90vh-180px)]">
                {/* Media Preview */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {renderMediaPreview()}
                </div>

                {/* Details Panel */}
                <div className="w-80 border-l border-gray-5/20 p-6 overflow-y-auto">
                  <div className="">
                    {/* Basic Info */}
                    {!isEditing && (
                      <div>
                        <h3 className="text-lg font-medium text-light-100 font-sofia-sans mb-3">
                          File Information
                        </h3>
                        <div className="">
                          <div className="flex justify-between items-center gap-1 flex-wrap border-b border-gray-200 py-2">
                            <span className="text-gray-4 font-sofia-sans text-base">
                              Name:
                            </span>
                            <p className="text-light-100 font-sofia-sans break-all text-sm">
                              {media.name || "Unknown"}
                            </p>
                          </div>
                          <div className="flex justify-between items-center gap-2 border-b border-gray-200 py-2">
                            <span className="text-gray-4 font-sofia-sans text-base">
                              Type:
                            </span>
                            <p className="text-light-100 font-sofia-sans capitalize text-sm">
                              {media.type}
                            </p>
                          </div>
                          {media.alt && (
                            <div className="flex justify-between items-center gap-2 border-b border-gray-200 py-2">
                              <span className="text-gray-4 font-sofia-sans text-base">
                                Alt:
                              </span>
                              <p className="text-light-100 font-sofia-sans text-sm">
                                {media.alt ? media.alt : "Unknown"}
                              </p>
                            </div>
                          )}
                          {media.size && (
                            <div className="flex justify-between items-center gap-2 border-b border-gray-200 py-2">
                              <span className="text-gray-4 font-sofia-sans text-base">
                                Size:
                              </span>
                              <p className="text-light-100 font-sofia-sans text-sm">
                                {media.size ? media.size : "Unknown"}
                              </p>
                            </div>
                          )}
                          {media.format && (
                            <div className="flex justify-between items-center gap-2 border-b border-gray-200 py-2">
                              <span className="text-gray-4 font-sofia-sans text-base">
                                Format:
                              </span>
                              <p className="text-light-100 font-sofia-sans text-sm">
                                {media.format ? media.format : "Unknown"}
                              </p>
                            </div>
                          )}
                          {media.width && media.height && (
                            <div className="flex justify-between items-center gap-2 border-b border-gray-200 py-2">
                              <span className="text-gray-4 font-sofia-sans text-base">
                                Dimensions:
                              </span>
                              <p className="text-light-100 font-sofia-sans text-sm">
                                {media.width}px × {media.height}px
                              </p>
                            </div>
                          )}
                          {media.createdAt && (
                            <div className="flex justify-between items-center gap-2 border-b border-gray-200 py-2">
                              <span className="text-gray-4 font-sofia-sans text-base">
                                Created:
                              </span>
                              <p className="text-light-100 font-sofia-sans text-sm">
                                {formatDate(media.createdAt)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {/* URL */}
                    <div className="py-2">
                      <h3 className="text-base font-medium text-light-100 font-sofia-sans mb-2">
                        URL
                      </h3>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={media.src}
                          readOnly
                          className="flex-1 px-3 py-2 bg-gray-5/10 border border-gray-5/20 rounded text-xs text-light-100 font-sofia-sans"
                        />
                        <button
                          onClick={copyToClipboard}
                          className="p-2 text-gray-4 hover:text-accent-100 transition-colors"
                          title="Copy URL"
                        >
                          {copied ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Editable Fields */}
                    {isEditing ? (
                      <div className="space-y-4">
                        <InputField
                          label="Alt Text"
                          name="altText"
                          value={formData.altText}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              altText: e.target.value,
                            }))
                          }
                          placeholder="Describe this media for accessibility"
                        />

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-light-100 font-sofia-sans">
                            Visibility
                          </label>
                          <div className="flex items-center gap-3">
                            <Switch.Root
                              checked={formData.isPublic || false}
                              onCheckedChange={(checked) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  isPublic: checked,
                                }))
                              }
                              className="w-11 h-6 bg-gray-5/20 rounded-full data-[state=checked]:bg-blue-100 transition-colors"
                            >
                              <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform data-[state=checked]:translate-x-5 translate-x-0.5" />
                            </Switch.Root>
                            <span className="text-sm text-light-100 font-sofia-sans">
                              {formData.isPublic ? "Public" : "Private"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-4 font-sofia-sans text-base">
                            Public files are accessible via direct URL
                          </p>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <button
                            onClick={handleSave}
                            disabled={updateLoading}
                            className="flex-1 px-4 py-2 bg-blue-100 text-white rounded-lg font-sofia-sans font-medium hover:bg-blue-100/90 transition-colors disabled:opacity-50"
                          >
                            {updateLoading ? "Saving..." : "Save Changes"}
                          </button>
                          <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 bg-gray-5/20 text-light-100 rounded-lg font-sofia-sans font-medium hover:bg-gray-5/30 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {media.altText && (
                          <div>
                            <h3 className="text-sm font-medium text-light-100 font-sofia-sans mb-2">
                              Alt Text
                            </h3>
                            <p className="text-sm text-gray-4 font-sofia-sans text-base">
                              {media.altText}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Danger Zone */}
                    {onDelete && (
                      <div className="pt-6 border-t border-gray-5/20">
                        <h3 className="text-sm font-medium text-red-400 font-sofia-sans mb-3">
                          Danger Zone
                        </h3>
                        <button
                          onClick={handleDelete}
                          disabled={deleteLoading}
                          className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-sofia-sans font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          {deleteLoading ? "Deleting..." : "Delete Media"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </Dialog.Content>
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default MediaViewModal;
