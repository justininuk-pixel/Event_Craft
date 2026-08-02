import React, { useId } from "react";
import clsx from "clsx";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showCharCounter?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      success = false,
      helperText,
      leftIcon,
      rightIcon,
      showCharCounter = false,
      disabled = false,
      value,
      maxLength,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || `input-${generatedId}`;
    const errorId = `input-error-${inputId}`;
    const helperId = `input-helper-${inputId}`;

    const charCount = typeof value === "string" || typeof value === "number"
      ? String(value).length
      : 0;

    // Never forward a NaN/invalid maxLength to the DOM — React warns and the attribute is
    // meaningless. Callers occasionally compute this from config that can be undefined.
    const safeMaxLength =
      typeof maxLength === "number" && Number.isFinite(maxLength) ? maxLength : undefined;

    const hasDescription = !!error || !!helperText;
    const descriptionIds = clsx(
      error && errorId,
      helperText && helperId
    ) || undefined;

    return (
      <div className="flex flex-col space-y-1.5 w-full select-none">
        {/* Label and Character Counter Header */}
        <div className="flex justify-between items-center">
          {label && (
            <label
              htmlFor={inputId}
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

        {/* Input box wrap */}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <span className="absolute left-3.5 text-muted-foreground flex items-center justify-center shrink-0 pointer-events-none">
              {leftIcon}
            </span>
          )}
          
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            value={value}
            maxLength={safeMaxLength}
            aria-invalid={!!error}
            aria-describedby={hasDescription ? descriptionIds : undefined}
            className={clsx(
              "w-full h-11 bg-card text-foreground border rounded-xl text-sm transition-all focus:outline-none focus-ring disabled:opacity-50 disabled:pointer-events-none placeholder:text-muted-foreground/60",
              {
                "pl-10": leftIcon,
                "pr-10": rightIcon,
                "px-4": !leftIcon && !rightIcon,
                "border-destructive focus:ring-destructive": error,
                "border-emerald-500 focus:ring-emerald-500": success && !error,
                "border-border focus:border-primary": !error && !success,
              },
              className
            )}
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-3.5 text-muted-foreground flex items-center justify-center shrink-0 pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>

        {/* Helper or Error footer messages */}
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

Input.displayName = "Input";
