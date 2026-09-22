"use client";

import { FormFieldError } from "@/types";
import dynamic from "next/dynamic";
const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
});
import { useEffect, useMemo, useRef, useState } from "react";

const RichTextEditor = ({
  placeholder = "Please enter description",
  error,
  label,
  helpText,
  required = false,
  value,
  onChange,
  className = "",
  labelClassName = "",
  darkMode = false,
}: {
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: FormFieldError;
  label?: string;
  helpText?: string;
  required?: boolean;
  value?: string;
  className?: string;
  labelClassName?: string;
  darkMode?: boolean;
}) => {
  const editor = useRef(null);
  const [content, setContent] = useState("");
  const config = useMemo(
    () => ({
      readonly: false,
      height: 400,
      placeholder,
      buttons:
        "fontsize,bold,italic,underline,link,strikethrough,eraser,ul,ol,paragraph,lineHeight,paste",
      style: darkMode ? {
        background: '#1e293b',
        color: '#f1f5f9',
      } : undefined,
    }),
    [placeholder, darkMode]
  );
  
  useEffect(() => {
    if (value) {
      setContent(value);
    } else {
      setContent("");
    }
  }, [value]);
  
  return (
    <div>
      {label && (
        <label className={`block text-sm mb-2 font-sofia-sans ${labelClassName || "text-light-100"}`}>
          {label} {required && "*"}
        </label>
      )}
      <div className={darkMode ? "jodit-dark-theme" : ""}>
        <JoditEditor
          ref={editor}
          value={content}
          className={className}
          tabIndex={1}
          config={config}
          onChange={(newContent) => {
            setContent(newContent);
            if (onChange) {
              onChange(newContent);
            }
          }}
        />
      </div>
      {error?.message && (
        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <p className="text-red-500 text-xs">{error.message}</p>
        </div>
      )}
      {!error?.message && helpText && (
        <p className="text-xs mt-2 text-gray-500">{helpText}</p>
      )}
      
      {/* Dark theme styles */}
      {darkMode && (
        <style jsx global>{`
          .jodit-dark-theme .jodit-workplace,
          .jodit-dark-theme .jodit-wysiwyg {
            background-color: #1e293b !important;
            color: #f1f5f9 !important;
          }
          
          .jodit-dark-theme .jodit-toolbar {
            background-color: #0f172a !important;
            border-color: #334155 !important;
          }
          
          .jodit-dark-theme .jodit-toolbar-button {
            color: #f1f5f9 !important;
          }
          
          .jodit-dark-theme .jodit-toolbar-button:hover {
            background-color: #334155 !important;
          }
          
          .jodit-dark-theme .jodit-container {
            border-color: #334155 !important;
          }
          
          .jodit-dark-theme .jodit-status-bar {
            background-color: #0f172a !important;
            border-color: #334155 !important;
            color: #94a3b8 !important;
          }
        `}</style>
      )}
    </div>
  );
};

export default RichTextEditor;