import React from "react";
import clsx from "clsx";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circle" | "card" | "image";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  variant = "text",
  width,
  height,
  className,
  style,
  ...props
}: SkeletonProps) {
  const customStyles: React.CSSProperties = {
    width: width !== undefined ? (typeof width === "number" ? `${width}px` : width) : undefined,
    height: height !== undefined ? (typeof height === "number" ? `${height}px` : height) : undefined,
    ...style,
  };

  return (
    <div
      role="progressbar"
      aria-busy="true"
      aria-label="Loading content..."
      style={customStyles}
      className={clsx(
        "skeleton select-none pointer-events-none",
        {
          "h-4 w-full rounded-md": variant === "text",
          "rounded-full shrink-0": variant === "circle",
          "h-48 w-full rounded-2xl": variant === "card",
          "aspect-video w-full rounded-xl": variant === "image",
        },
        className
      )}
      {...props}
    />
  );
}
