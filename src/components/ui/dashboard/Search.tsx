import React from "react";

interface FormFieldError {
  message?: string | number | number[];
  type?: string;
}
interface FormFieldProps {
  label?: string;
  value?: string | number;
  error?: FormFieldError;
  required?: boolean;
  helpText?: string;
  name?: string;
  className?: string;
  placeholder?: string;
  pattern?: string;
  type?: "text" | "number" | "tel" | "email" | "password" | "url" | "datetime-local";
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  mode?: string;
  inputStyle?: string;
  onBlur?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SerchField: React.FC<FormFieldProps> = ({
  label,
  value,
  error,
  required = false,
  helpText,
  className = "",
  name,
  onChange,
  type,
  pattern,
  placeholder,
  mode,
  inputStyle,
  onBlur,
  ...rest
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div>
        {label && (
          <label
            className={`block text-sm  mb-2 font-sofia-sans ${
              mode === "light" ? " text-dark-blue-cm" : "text-light-100"
            }`}
          >
            {label} {required && "*"}
          </label>
        )}
        <input
          type={type || "text"}
          {...(value !== undefined ? { value: value || "" } : {})}
          name={name}
          onChange={onChange}
          className={` ${
            inputStyle || ""
          } w-full px-3 py-2  border border-[#334155]   focus:ring-1 focus:border-transparent  font-sofia-sans placeholder:text-[#f1f5f9]
          ${
            error?.message
              ? "!border-red-500  focus:ring-red-500 "
              : " focus:ring-accent-100/70"
          }
          ${
            mode === "light"
              ? "bg-light-300 text-dark-blue-cm"
              : "bg-gray-5/10 text-[#f1f5f9]"
          }`}
          placeholder={placeholder || ""}
          pattern={pattern}
          onBlur={onBlur ? onBlur : undefined}
          {...rest}
        />
      </div>
      {error?.message && (
        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 min-w-2  bg-red-500 " />
          <p className="text-red-500 text-left text-xs">{error.message}</p>
        </div>
      )}
      {!error?.message && helpText && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
};
