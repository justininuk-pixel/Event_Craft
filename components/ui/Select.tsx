"use client";

import React, { useState, useRef, useEffect, useMemo, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function Select({
  options,
  value,
  onChange,
  label,
  placeholder = "Select an option",
  disabled = false,
  className,
  id,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionListRef = useRef<HTMLUListElement>(null);

  const generatedId = useId();
  const selectId = id || `select-${generatedId}`;
  const listboxId = `select-listbox-${selectId}`;
  const labelId = `select-label-${selectId}`;

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === value);
  }, [options, value]);

  // Reset search and active index when closing/opening
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    } else {
      const selectedIndex = filteredOptions.findIndex((opt) => opt.value === value);
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
      
      // Auto focus search input on open
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, value, filteredOptions]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          filteredOptions.length > 0 ? (prev + 1) % filteredOptions.length : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) =>
          filteredOptions.length > 0
            ? (prev - 1 + filteredOptions.length) % filteredOptions.length
            : 0
        );
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[activeIndex]) {
          onChange(filteredOptions[activeIndex].value);
          setIsOpen(false);
          triggerRef.current?.focus();
        }
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  // Scroll active option into view inside dropdown
  useEffect(() => {
    if (isOpen && optionListRef.current) {
      const activeEl = optionListRef.current.children[activeIndex + (options.length > 5 ? 1 : 0)] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex, isOpen, options.length]);

  return (
    <div
      ref={containerRef}
      className={clsx("flex flex-col space-y-1.5 w-full relative", isOpen ? "z-[50]" : "z-[10]", className)}
    >
      {label && (
        <label
          id={labelId}
          htmlFor={selectId}
          className="text-sm font-semibold text-muted-foreground select-none"
        >
          {label}
        </label>
      )}

      {/* Select Trigger Trigger Button */}
      <button
        id={selectId}
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-labelledby={label ? labelId : undefined}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={clsx(
          "w-full h-11 px-4 flex items-center justify-between bg-card border border-border rounded-xl text-foreground text-sm focus:outline-none focus-ring transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98]",
          isOpen && "border-primary"
        )}
      >
        <span className={clsx("truncate", !selectedOption && "text-muted-foreground")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={clsx(
            "h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0",
            isOpen && "rotate-180 text-foreground"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Floating Dropdown Listbox */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full mt-1.5 z-floating max-h-60 rounded-xl border border-border bg-card shadow-xl overflow-hidden flex flex-col focus:outline-none"
          >
            {/* Search Input for lists with >5 elements */}
            {options.length > 5 && (
              <div className="p-2 border-b border-border bg-secondary/30 flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-muted-foreground shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search options..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-none text-sm text-foreground placeholder-muted-foreground focus:outline-none py-1 h-7"
                />
              </div>
            )}

            {/* Listbox Options */}
            <ul
              id={listboxId}
              ref={optionListRef}
              role="listbox"
              aria-labelledby={label ? labelId : undefined}
              className="flex-1 overflow-y-auto py-1 focus:outline-none"
            >
              {filteredOptions.length === 0 ? (
                <li className="px-4 py-3 text-sm text-muted-foreground text-center">
                  No matching options found
                </li>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const isSelected = opt.value === value;
                  const isHighlighted = idx === activeIndex;
                  return (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      id={`select-option-${selectId}-${idx}`}
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                        triggerRef.current?.focus();
                      }}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={clsx(
                        "px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-colors select-none",
                        {
                          "bg-primary/10 text-primary font-semibold": isSelected,
                          "bg-secondary text-foreground": isHighlighted && !isSelected,
                          "text-foreground": !isSelected && !isHighlighted,
                        }
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && (
                        <svg className="h-4.5 w-4.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
