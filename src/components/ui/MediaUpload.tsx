import React, { ChangeEvent } from "react";

interface MediaUploadProps {
  uploadInputId: string;
  requiredWidth?: number;
  requiredHeight?: number;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  multiple?: boolean;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  uploadInputId,
  requiredWidth,
  requiredHeight,
  onFileChange,
  multiple = false,
}) => {
  return (
    <div className="mb-4">
      <label
        htmlFor={uploadInputId}
        className="flex mb-2 flex-col items-center justify-center w-full h-48 border-2 border-gray-200 border-dashed cursor-pointer overflow-hidden"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg
            className="w-8 h-8 mb-4 text-gray-500"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
          </svg>
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Click to upload</span>
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF, or WebP{" "}
            {requiredWidth && `(${requiredWidth}px X ${requiredHeight}px)`}
          </p>
        </div>

        <input
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          id={uploadInputId}
          type="file"
          className="hidden"
          onChange={onFileChange}
          multiple={multiple}
        />
      </label>
    </div>
  );
};

export default MediaUpload;
