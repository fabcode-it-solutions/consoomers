"use client";

import * as Select from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import React, { useState } from "react";

interface SelectFieldProps {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  options: string[];
  error?: string;
  name: string;
  label?: string;
  required?: boolean;
  showError?: boolean;
  labelClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  value = "",
  onChange,
  placeholder,
  options,
  error,
  label,
  required = false,
  showError = false,
  labelClassName = "",
  triggerClassName = "",
  contentClassName = "",
}) => {
  const [touched, setTouched] = useState(false);

  const displayError = !!error && (touched || showError);

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label
          className={`text-base font-medium flex gap-1 items-center ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <Select.Root
        value={value || ""}
        onValueChange={(val) => {
          setTouched(true);
          onChange?.(val);
        }}
        onOpenChange={(open) => {
          if (open) setTouched(true);
        }}
      >
        <Select.Trigger
          className={`w-full px-4 py-3 rounded-none border focus:ring-1 outline-none flex items-center justify-between ${
            displayError
              ? "border-red-500"
              : "border-gray-200 dark:border-[#334155] focus:border-[#0060FF] focus:ring-[#0060FF]"
          } ${triggerClassName || "bg-white hover:bg-gray-50 dark:bg-dark-200 dark:hover:bg-dark-300 dark:text-[#f1f5f9]"}`}
        >
          <Select.Value placeholder={placeholder} />
          <Select.Icon>
            <ChevronDown className="w-4 h-4" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content 
            className={`rounded-none shadow-lg border overflow-hidden z-50 ${
              contentClassName || "bg-white dark:bg-dark-200 border-gray-200 dark:border-[#334155]"
            }`}
          >
            <Select.Viewport className="p-2 bg-white dark:bg-[#1e293b]">
              {options.map((opt) => (
                <Select.Item
                  key={opt}
                  value={opt}
                  className="px-4 py-2 rounded-lg outline-none cursor-pointer hover:bg-purple-50 dark:hover:bg-[#334155] focus:bg-purple-50 dark:focus:bg-[#334155] flex items-center justify-between dark:text-[#f1f5f9]"
                >
                  <Select.ItemText>{opt}</Select.ItemText>
                  {value === opt && (
                    <Select.ItemIndicator>
                      <Check className="w-4 h-4 text-purple-600" />
                    </Select.ItemIndicator>
                  )}
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      {displayError && (
        <div className="flex items-center gap-2 mt-1">
          <span className="w-[10px] h-[10px] rounded-full bg-red-500" />
          <p className="text-xs text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
};

export default SelectField;