"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { create } from "zustand";
import { Toast } from "./Toast";

export interface ToastItem {
  id: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => string;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    return id;
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export function useToast() {
  const addToast = useToastStore((state) => state.addToast);
  const removeToast = useToastStore((state) => state.removeToast);

  return {
    toast: (message: string, type: ToastItem["type"] = "success", options?: { duration?: number; action?: ToastItem["action"] }) => {
      return addToast({ message, type, ...options });
    },
    success: (message: string, options?: { duration?: number; action?: ToastItem["action"] }) =>
      addToast({ message, type: "success", ...options }),
    error: (message: string, options?: { duration?: number; action?: ToastItem["action"] }) =>
      addToast({ message, type: "error", ...options }),
    info: (message: string, options?: { duration?: number; action?: ToastItem["action"] }) =>
      addToast({ message, type: "info", ...options }),
    warning: (message: string, options?: { duration?: number; action?: ToastItem["action"] }) =>
      addToast({ message, type: "warning", ...options }),
    dismiss: removeToast,
  };
}

export function ToastQueue() {
  const [mounted, setMounted] = useState(false);
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    // Route stray alert() calls into the toast UI. The original replaced window.alert without
    // ever restoring it, so unmounting (or a Fast Refresh cycle) left the page permanently
    // patched and could stack patches on top of each other.
    const originalAlert = window.alert;
    window.alert = (message?: unknown) => {
      useToastStore.getState().addToast({
        message: String(message),
        type: "warning",
        duration: 5000,
      });
    };

    return () => {
      window.alert = originalAlert;
    };
  }, []);

  if (!mounted) return null;

  // Max 3 visible at a time
  const visibleToasts = toasts.slice(0, 3);

  const container = (
    <div
      aria-live="polite"
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-toast flex flex-col gap-3 w-full max-w-sm pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {visibleToasts.map((t) => (
          <Toast
            key={t.id}
            id={t.id}
            message={t.message}
            type={t.type}
            duration={t.duration}
            action={t.action}
            onClose={() => removeToast(t.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );

  return createPortal(container, document.body);
}
