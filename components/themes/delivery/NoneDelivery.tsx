"use client";

import React, { useEffect } from "react";
import { prefersReducedMotion } from "../../../lib/utils/device";

interface DeliveryProps {
  cardId?: string;
  onComplete: () => void;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string | string[];
    text: string;
    textSecondary: string;
  };
  emoji?: string;
  recipient?: string;
}

export function NoneDelivery({ onComplete, cardId }: DeliveryProps) {
  useEffect(() => {
    if (cardId && typeof window !== "undefined") {
      localStorage.setItem(`delivered-${cardId}`, "true");
    }

    const duration = prefersReducedMotion() ? 0 : 300;
    const timer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [onComplete, cardId]);

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="animate-pulse text-zinc-400">Loading celebration...</div>
    </div>
  );
}

export default NoneDelivery;
