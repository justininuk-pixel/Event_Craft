"use client";

import React from "react";
import { Select } from "@/components/ui/Select";

interface CultureFilterProps {
  selectedCulture: string;
  onChange: (culture: string) => void;
  showEmojis?: boolean;
}

const CULTURES = [
  { id: "all", label: "All Cultures", emoji: "🌍" },
  { id: "Universal", label: "Universal", emoji: "✨" },
  { id: "Western", label: "Western / European", emoji: "🇪🇺" },
  { id: "Asian", label: "East Asian / Lunar", emoji: "🏮" },
  { id: "South Asian", label: "South Asian / Desi", emoji: "🪔" },
  { id: "African", label: "African / Tribal", emoji: "🦁" },
  { id: "Latin", label: "Latin American / Hispanic", emoji: "💃" },
  { id: "Middle Eastern", label: "Middle Eastern / Arab", emoji: "🕌" },
  { id: "Oceanian", label: "Oceanian / Pacific", emoji: "🌊" },
];

export function CultureFilter({
  selectedCulture,
  onChange,
  showEmojis = false,
}: CultureFilterProps) {
  const selectOptions = React.useMemo(() => {
    return CULTURES.map((c) => ({
      value: c.id,
      label: showEmojis ? `${c.emoji} ${c.label}` : c.label,
    }));
  }, [showEmojis]);

  // Handle case sensitivity in comparisons
  const activeValue = React.useMemo(() => {
    const found = CULTURES.find(c => c.id.toLowerCase() === selectedCulture.toLowerCase());
    return found ? found.id : "all";
  }, [selectedCulture]);

  return (
    <div className="w-full flex flex-col gap-1.5">
      <Select
        id="culture-filter-select"
        label="Culture / Origin"
        options={selectOptions}
        value={activeValue}
        onChange={onChange}
        placeholder="Filter by culture"
      />
    </div>
  );
}

export default CultureFilter;
