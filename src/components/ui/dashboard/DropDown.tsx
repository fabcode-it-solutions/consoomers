"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import Image from "next/image";



export interface SelectOption {
  value: string;
  label: string;
  logo?: string;
}
interface FormFieldError {
  message?: string | number | number[];
  type?: string;
}
type DropdownType = {
  onValueChange?: (value: string) => void;
  fetchfilterOptions?: (
    page: number,
    search?: string
  ) => Promise<SelectOption[]>;
  label?: string;
  placeholder?: string;
  options?: SelectOption[];
  selectedText?: string;
  mode?: "light" | "dark";
  className?: string;
  error?: FormFieldError;
  enableSearch?: boolean;
};

const Dropdown = ({
  onValueChange,
  fetchfilterOptions,
  label,
  options,
  placeholder,
  enableSearch = false,
  selectedText,
  mode,
  className,
  error,
}: DropdownType) => {
  const [selected, setSelected] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [filterOptions, setfilterOptions] = useState<SelectOption[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const viewportRef = useRef<HTMLDivElement>(null);

  // 🔹 Fetch filterOptions when search or page changes
  useEffect(() => {
    let cancel = false;
    const loadfilterOptions = async () => {
      if (fetchfilterOptions) {
        try {
          // setLoading(true);
          const newfilterOptions = await fetchfilterOptions(page, search);
          if (!cancel) {
            if (page === 1) {
              setfilterOptions(newfilterOptions);
            } else {
              setfilterOptions((prev) => [...prev, ...newfilterOptions]);
            }
            setHasMore(newfilterOptions.length > 0);
          }
        } finally {
          setLoading(false);
        }
      }
    };
    if (fetchfilterOptions) {
      loadfilterOptions();
    }
    return () => {
      cancel = true;
    };
  }, [page, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (options) {
      setfilterOptions(options);
    }
  }, [options]);

  return (
    <div className={`${className || ""}`}>
      {label && (
        <label
          className={`block text-sm mb-2 font-sofia-sans ${
            mode == "light" ? "text-[#606060]" : "text-gray-4"
          }`}
        >
          {label}
        </label>
      )}
      <Select.Root
        value={selected || selectedText}
        onValueChange={(e) => {
          setSelected(e);
          if (e && onValueChange) onValueChange(e);
        }}
        // onOpenChange={(e) => setLoading(e)}
      >
        <Select.Trigger
          className={`w-full capitalize px-3 flex items-center justify-between
            ${error?.message ? "!border-red-500" : ""}
          ${
            mode == "light"
              ? "bg-[#F9F9F9] text-dark-blue-cm py-[12.5px]  border-[#334155] border"
              : "bg-gray-5/10  text-[#f1f5f9] py-2 border border-[#334155]"
          }`}
        >
          <Select.Value placeholder={placeholder || "Select..."} />
          <Select.Icon>
            <ChevronDown className="w-4 h-4" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            className={`border border-[#334155]  shadow-lg overflow-hidden z-[9999]
        ${mode == "light" ? "bg-white" : "bg-[#334155]"}
      `}
            position="popper"
          >
            {/* Search input */}
            {enableSearch && (
              <div className="p-2 border-b border-[#334155]">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className={`w-full px-2 py-1 text-sm rounded outline-none
                  ${
                    mode == "light"
                      ? "bg-[#F9F9F9] text-dark-blue-cm"
                      : "bg-gray-5/20 text-[#f1f5f9]"
                  }`}
                />
              </div>
            )}

            {/* filterOptions */}
            <Select.Viewport
              ref={viewportRef}
              defaultValue={selectedText || ""}
              className="p-1 max-h-60 overflow-y-auto"
            >
              {filterOptions.length > 0 ? (
                filterOptions.map((type) => (
                  <Select.Item
                    key={type.value}
                    value={type.value || "sdfsdf"}
                    className={`px-3 py-2 capitalize cursor-pointer rounded font-sofia-sans
                      ${
                        mode == "light"
                          ? "text-dark-blue-cm hover:bg-light-100"
                          : "text-[#f1f5f9] hover:bg-accent-100/10"
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      {type.logo && (
                        <Image
                          src={type.logo}
                          alt={type.label}
                          width={30}
                          height={30}
                          className="bg-white "
                        />
                      )}{" "}
                      <Select.ItemText>{type.label}</Select.ItemText>
                    </span>
                  </Select.Item>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-400 text-sm">
                  No results found
                </div>
              )}
              {loading && (
                <div className="px-3 py-2 text-gray-400 text-sm">
                  Loading...
                </div>
              )}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      {error?.message && (
        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2  bg-red-500" />
          <p className="text-red-500 text-xs">{error.message}</p>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
