import React, { useEffect, useRef, useId, useCallback } from "react";
import clsx from "clsx";

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  showCharCounter?: boolean;
  autoGrow?: boolean;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      label,
      error,
      success = false,
      helperText,
      showCharCounter = false,
      autoGrow = true,
      disabled = false,
      value,
      maxLength,
      rows = 3,
      onChange,
      id,
      ...props
    },
    ref
  ) => {
    const localRef = useRef<HTMLTextAreaElement>(null);
    const generatedId = useId();
    const textareaId = id || `textarea-${generatedId}`;
    const errorId = `textarea-error-${textareaId}`;
    const helperId = `textarea-helper-${textareaId}`;

    const charCount = typeof value === "string" || typeof value === "number"
      ? String(value).length
      : 0;

    // Never forward a NaN/invalid maxLength to the DOM (React warns; attribute is meaningless).
    const safeMaxLength =
      typeof maxLength === "number" && Number.isFinite(maxLength) ? maxLength : undefined;

    const hasDescription = !!error || !!helperText;
    const descriptionIds = clsx(
      error && errorId,
      helperText && helperId
    ) || undefined;

    // Auto grow height handler
    const adjustHeight = useCallback((el: HTMLTextAreaElement) => {
      if (!autoGrow) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }, [autoGrow]);

    // Keep internal and external ref synced
    const setCombinedRef = (node: HTMLTextAreaElement | null) => {
      (localRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      }
    };

    useEffect(() => {
      if (localRef.current) {
        adjustHeight(localRef.current);
      }
    }, [value, autoGrow, adjustHeight]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      adjustHeight(e.target);
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="flex flex-col space-y-1.5 w-full select-none">
        {/* Label and Character Counter Header */}
        <div className="flex justify-between items-center">
          {label && (
            <label
              htmlFor={textareaId}
              className={clsx(
                "text-sm font-semibold transition-colors",
                error ? "text-destructive font-bold" : "text-muted-foreground",
                disabled && "opacity-50"
              )}
            >
              {label}
            </label>
          )}
          {showCharCounter && safeMaxLength && (
            <span className={clsx("text-xs font-semibold", charCount >= safeMaxLength ? "text-destructive" : "text-muted-foreground")}>
              {charCount} / {safeMaxLength}
            </span>
          )}
        </div>

        {/* Text Area */}
        <textarea
          id={textareaId}
          ref={setCombinedRef}
          disabled={disabled}
          value={value}
          maxLength={safeMaxLength}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={hasDescription ? descriptionIds : undefined}
          onChange={handleChange}
          className={clsx(
            "w-full bg-card text-foreground border rounded-xl text-sm px-4 py-3 transition-all focus:outline-none focus-ring disabled:opacity-50 disabled:pointer-events-none placeholder:text-muted-foreground/60 resize-none",
            {
              "border-destructive focus:ring-destructive": error,
              "border-emerald-500 focus:ring-emerald-500": success && !error,
              "border-border focus:border-primary": !error && !success,
            },
            className
          )}
          {...props}
        />

        {/* Description messages */}
        {hasDescription && (
          <div className="flex flex-col space-y-0.5">
            {error && (
              <p id={errorId} role="alert" className="text-xs font-semibold text-destructive animate-in fade-in slide-in-from-top-1">
                {error}
              </p>
            )}
            {helperText && !error && (
              <p id={helperId} className="text-xs text-muted-foreground">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";
