import React, { ReactNode } from "react";
import { InputFieldProps } from "@/types";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    Omit<InputFieldProps, "value"> {
  value?: React.InputHTMLAttributes<HTMLInputElement>["value"];
  leftIcon?: ReactNode;
  onLeftIconClick?: () => void;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
  error?: boolean;
  errorMessage?: string;
  label?: string;
  required?: boolean;
  border?: string;
  labelClassName?: string; // <-- NEW: custom label class
}

const InputField = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = "text",
      placeholder,
      className = "",
      value,
      onChange,
      error = false,
      errorMessage,
      label,
      required = false,
      leftIcon,
      onLeftIconClick,
      rightIcon,
      onRightIconClick,
      border = "border-gray-300 dark:border-gray-700",
      labelClassName = "", // <-- NEW: default empty string
      ...rest
    },
    ref
  ) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label className={`text-base font-normal flex gap-1 items-center ${labelClassName}`}>
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div className="relative w-full">
          {leftIcon && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={onLeftIconClick}
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={type}
            placeholder={placeholder || "Enter text"}
            value={value}
            onChange={onChange}
            className={`
              w-full px-4 py-3 rounded-none focus:outline-none focus:ring-1
              ${leftIcon ? "pl-10" : "pl-4"} 
              ${rightIcon ? "pr-10" : "pr-4"}

              ${
                error
                  ? "border-red-500 focus:ring-red-500"
                  : `${border} border-[1px] focus:ring-[#0060FF]`
              }

              ${className}
            `}
            {...rest}
          />

          {rightIcon && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={onRightIconClick}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {(error || errorMessage) && (
          <div className="flex items-center gap-2 mt-1">
            <span className="w-[10px] h-[10px] rounded-full bg-red-500" />
            <p className="text-red-500 text-xs">{errorMessage}</p>
          </div>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";
export default InputField;