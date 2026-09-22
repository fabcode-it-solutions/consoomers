import React, { useRef, useEffect, useCallback, useMemo } from "react";

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  className?: string;
  label?: string;
  helpText?: string;
  autoResize?: boolean;
}

export const TextArea = React.memo(
  React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
    (
      { error, className = "", label, helpText, autoResize = true, ...props },
      ref
    ) => {
      const innerRef = useRef<HTMLTextAreaElement | null>(null);

      const resize = useCallback(() => {
        if (innerRef.current && autoResize) {
          innerRef.current.style.height = "auto"; // reset
          innerRef.current.style.height = `${innerRef.current.scrollHeight}px`; // adjust
        }
      }, [autoResize]);

      const setRefs = useCallback(
        (el: HTMLTextAreaElement | null) => {
          innerRef.current = el;
          if (typeof ref === "function") {
            ref(el);
          } else if (ref) {
            (
              ref as React.MutableRefObject<HTMLTextAreaElement | null>
            ).current = el;
          }
        },
        [ref]
      );

      useEffect(() => {
        resize();
      }, [props.value, resize]);

      const textareaClasses = useMemo(
        () =>
          `w-full px-3 py-2 bg-white border border-gray-200  text-light-100 focus:ring-1 focus:ring-accent-100 focus:border-transparent font-sofia-sans resize-none max-h-[216px] ${
            error ? "border-red-500" : ""
          } ${className}`.trim(),
        [error, className]
      );

      const errorMessage = useMemo(
        () =>
          error ? (
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <p className="text-red-500 text-xs">{error}</p>
            </div>
          ) : null,
        [error]
      );

      const helpTextElement = useMemo(
        () =>
          helpText ? (
            <p className="text-xs text-gray-500 mt-1">{helpText}</p>
          ) : null,
        [helpText]
      );

      const labelElement = useMemo(
        () =>
          label ? (
            <label className="block text-sm text-light-100 mb-2 font-sofia-sans">
              {label}{" "}
              <span className="text-red-500">
                {props.required ? "*" : null}
              </span>
            </label>
          ) : null,
        [label, props.required]
      );

      return (
        <div>
          {labelElement}
          <textarea
            ref={setRefs}
            className={textareaClasses}
            onInput={resize}
            {...props}
          />
          {errorMessage}
          {helpTextElement}
        </div>
      );
    }
  )
);

TextArea.displayName = "TextArea";
