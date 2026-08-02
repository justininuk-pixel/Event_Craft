"use client";

import React from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps<T extends React.ElementType = "button"> = {
  as?: T;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "variant" | "size" | "loading" | "fullWidth" | "icon" | "iconRight">;

type ButtonComponent = (<T extends React.ElementType = "button">(
  props: ButtonProps<T> & { ref?: React.ComponentPropsWithRef<T>["ref"] }
) => React.JSX.Element) & { displayName?: string };

export const Button = React.forwardRef(
  function ButtonRender(
    {
      as,
      className,
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      icon,
      iconRight,
      disabled,
      children,
      ...props
    }: ButtonProps<any>,
    ref: React.ForwardedRef<any>
  ) {
    const Component = as || "button";
    const isDisabled = disabled || loading;

    const handleClick = (e: any) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try { navigator.vibrate(10); } catch (err) {}
      }
      if (props.onClick) {
        props.onClick(e);
      }
    };

    return (
      <Component
        ref={ref}
        disabled={isDisabled}
        className={clsx(
          "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus-ring disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97] active:brightness-95 select-none relative overflow-hidden",
          {
            "w-full": fullWidth,
            "bg-primary text-primary-foreground hover:brightness-110 shadow-md shadow-primary-glow": variant === "primary",
            "bg-secondary text-secondary-foreground hover:bg-muted border border-border": variant === "secondary",
            "bg-transparent hover:bg-secondary text-foreground": variant === "ghost",
            "bg-destructive text-destructive-foreground hover:brightness-110 shadow-md shadow-destructive/20": variant === "danger",
            "border border-border bg-transparent hover:bg-secondary text-foreground": variant === "outline",
            // Sizes & touch targets (minimum 44px height for md to comply with accessibility guidelines)
            "h-9 px-3.5 text-sm gap-1.5": size === "sm",
            "h-11 px-5 text-base gap-2 min-h-[44px]": size === "md",
            "h-14 px-7 text-lg gap-2.5 min-h-[56px]": size === "lg",
          },
          className
        )}
        {...(Component === "button" ? { type: props.type || "button" } : {})}
        {...props}
        onClick={handleClick}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && icon && <span className="inline-flex shrink-0">{icon}</span>}
        <span className={clsx("truncate inline-flex items-center justify-center", {
          "gap-1.5": size === "sm",
          "gap-2": size === "md",
          "gap-2.5": size === "lg",
        })}>
          {children}
        </span>
        {!loading && iconRight && <span className="inline-flex shrink-0">{iconRight}</span>}
      </Component>
    );
  }
) as unknown as ButtonComponent;

Button.displayName = "Button";
