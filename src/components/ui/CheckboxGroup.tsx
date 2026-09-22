/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

interface CheckboxGroupProps {
  name: string;
  label: string;
  options: string[];
  value?: string[]; // made optional for safety
  onChange: (val: string[]) => void;
  error?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  options,
  value = [], // ✅ default to empty array
  onChange,
  error,
  required,
  placeholder,
}) => {
  const handleCheck = (option: string) => {
    const updatedValue = value.includes(option)
      ? value.filter((v) => v !== option)
      : [...value, option];
    onChange(updatedValue);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-base font-medium flex gap-1 items-center">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {(!value || value.length === 0) && placeholder && (
        <p className="text-gray-400 text-sm italic">{placeholder}</p>
      )}

      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-2 cursor-pointer w-fit"
          >
            <input
              type="checkbox"
              checked={Array.isArray(value) && value.includes(option)} // ✅ safe check
              onChange={() => handleCheck(option)}
              className="accent-blue-500 cursor-pointer"
            />
            {option}
          </label>
        ))}
      </div>

      {error && <p className="text-red-500 text-base">{error}</p>}
    </div>
  );
};

export default CheckboxGroup;
