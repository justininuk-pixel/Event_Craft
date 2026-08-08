"use client";

import React from "react";
import { ThemeProvider } from "./ThemeProvider";
import { ToastQueue } from "@/components/ui/ToastQueue";
import { ErrorBoundary } from "@/components/ErrorBoundary";

/**
 * Client-side providers mounted once at the root of the app.
 *
 * `ThemeProvider` is required: `useTheme()` throws when no provider is above it, and `Navbar`
 * calls it, so without this every page that renders a Navbar crashes.
 * `ToastQueue` is the renderer for the `useToast()` store, without it every toast the app
 * fires is added to the store but never displayed.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        {children}
        <ToastQueue />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default AppProviders;
