"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Badge } from "./Badge";

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  badgeVariant?: "primary" | "secondary" | "success" | "warning" | "destructive";
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: "underline" | "pills" | "enclosed";
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = "pills",
  className,
}: TabsProps) {
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let targetIndex = -1;

    if (e.key === "ArrowRight") {
      targetIndex = (index + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      targetIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      targetIndex = 0;
    } else if (e.key === "End") {
      targetIndex = tabs.length - 1;
    }

    if (targetIndex !== -1) {
      e.preventDefault();
      const targetTab = tabs[targetIndex];
      onChange(targetTab.id);
      
      // Focus the newly active tab button
      setTimeout(() => {
        tabRefs.current[targetTab.id]?.focus();
      }, 50);
    }
  };

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={clsx(
        "flex w-full select-none",
        {
          "space-x-1 bg-secondary/80 p-1 rounded-2xl border border-border": variant === "pills",
          "border-b border-border space-x-6": variant === "underline",
          "border border-border rounded-xl bg-card overflow-hidden": variant === "enclosed",
        },
        className
      )}
    >
      {tabs.map((tab, idx) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[tab.id] = el;
            }}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={clsx(
              "relative flex items-center justify-center font-semibold text-sm transition-all focus:outline-none focus-ring",
              {
                // Pills variant
                "flex-1 px-4 py-2.5 rounded-xl z-base gap-2": variant === "pills",
                "text-primary-foreground": variant === "pills" && isActive,
                "text-muted-foreground hover:text-foreground hover:bg-secondary/40": variant === "pills" && !isActive,

                // Underline variant
                "px-1 py-3 border-b-2 border-transparent gap-2.5": variant === "underline",
                "text-primary font-bold": variant === "underline" && isActive,
                "text-muted-foreground hover:text-foreground": variant === "underline" && !isActive,

                // Enclosed variant
                "flex-1 px-4 py-3 border-r border-border last:border-r-0 gap-2": variant === "enclosed",
                "bg-background text-foreground": variant === "enclosed" && isActive,
                "bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/20": variant === "enclosed" && !isActive,
              }
            )}
          >
            {/* Sliding background/underline indicator */}
            {isActive && variant === "pills" && (
              <motion.div
                layoutId="active-pill-bg"
                className="absolute inset-0 bg-primary rounded-xl -z-base shadow-sm shadow-primary-glow"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}

            {isActive && variant === "underline" && (
              <motion.div
                layoutId="active-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}

            {isActive && variant === "enclosed" && (
              <motion.div
                layoutId="active-enclosed-indicator"
                className="absolute top-0 left-0 right-0 h-0.5 bg-primary"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}

            {tab.icon && <span className="inline-flex shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>

            {/* Tab Badge */}
            {tab.badge !== undefined && (
              <Badge
                variant={tab.badgeVariant || (isActive ? "primary" : "secondary")}
                size="sm"
                className={clsx(
                  "ml-1 font-bold shrink-0",
                  isActive && variant === "pills" && "bg-white text-primary border-none shadow-sm"
                )}
              >
                {tab.badge}
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}
