"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Home, Compass, Plus, FolderOpen, Search } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const handleOpenSearch = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-command-palette"));
    }
  };

  const items = [
    { label: "Home", href: "/", icon: Home },
    { label: "Explore", href: "/explore", icon: Compass },
    { label: "Create", href: "/editor", icon: Plus, primary: true },
    { label: "Projects", href: "/projects", icon: FolderOpen },
    { label: "Search", href: "#search", icon: Search, onClick: handleOpenSearch },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-nav border-t border-border/70 bg-card/90 backdrop-blur-md pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      aria-label="Primary"
    >
      <div className="flex h-16 items-stretch justify-around px-1.5">
        {items.map((item) => {
          const isSearch = item.href === "#search";
          const isActive =
            !isSearch &&
            (pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href)));
          const Icon = item.icon;

          const inner = (
            <>
              {item.primary ? (
                <span
                  className={clsx(
                    "flex items-center justify-center w-11 h-11 -mt-5 rounded-2xl shadow-lg shadow-primary/30 ring-4 ring-card transition-transform active:scale-95",
                    "bg-primary text-primary-foreground"
                  )}
                >
                  <Icon className="w-6 h-6" strokeWidth={2.5} />
                </span>
              ) : (
                <Icon
                  className={clsx("w-5.5 h-5.5 transition-transform", isActive && "scale-110")}
                  strokeWidth={isActive ? 2.6 : 2}
                />
              )}
              <span className={clsx("text-[10px] font-bold", item.primary && "mt-0.5")}>
                {item.label}
              </span>
            </>
          );

          const shared = clsx(
            "flex flex-col items-center justify-center flex-1 gap-0.5 min-h-[48px] rounded-xl transition-colors focus-ring select-none",
            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
          );

          if (isSearch) {
            return (
              <button key={item.label} onClick={item.onClick} className={shared} aria-label="Search">
                {inner}
              </button>
            );
          }

          return (
            <Link key={item.label} href={item.href} className={shared} aria-current={isActive ? "page" : undefined}>
              {inner}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
