import React from "react";
import clsx from "clsx";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "success" | "warning" | "info" | "destructive";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  icon?: React.ReactNode;
}

export function Badge({
  className,
  variant = "primary",
  size = "md",
  dot = false,
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center font-semibold rounded-full select-none transition-all duration-200 gap-1.5 leading-none",
        {
          // Color variants
          "bg-primary/10 text-primary border border-primary/20": variant === "primary",
          "bg-secondary text-secondary-foreground border border-border": variant === "secondary",
          "bg-accent/10 text-accent border border-accent/20": variant === "accent",
          "border border-border text-muted-foreground bg-transparent": variant === "outline",
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20": variant === "success",
          "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20": variant === "warning",
          "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20": variant === "info",
          "bg-destructive/10 text-destructive border border-destructive/20": variant === "destructive",
          
          // Sizes
          "px-1.5 py-0.5 text-[10px]": size === "sm",
          "px-2.5 py-1 text-xs": size === "md",
          "px-3 py-1.5 text-sm": size === "lg",
        },
        className
      )}
      {...props}
    >
      {/* Optional Dot indicator */}
      {dot && (
        <span
          className={clsx("h-1.5 w-1.5 rounded-full shrink-0", {
            "bg-primary": variant === "primary",
            "bg-muted-foreground": variant === "secondary" || variant === "outline",
            "bg-accent": variant === "accent",
            "bg-emerald-500": variant === "success",
            "bg-amber-500": variant === "warning",
            "bg-blue-500": variant === "info",
            "bg-destructive": variant === "destructive",
          })}
        />
      )}
      
      {/* Optional custom icon */}
      {!dot && icon && <span className="inline-flex shrink-0">{icon}</span>}
      
      <span className="truncate">{children}</span>
    </span>
  );
}
