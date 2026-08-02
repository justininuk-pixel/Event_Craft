"use client";

import React, { useEffect, useState } from "react";
import { Bookmark, Check, Trash2, Plus } from "lucide-react";
import { useEditorStore } from "@/lib/editor/store";
import { getBrandKits, saveBrandKit, deleteBrandKit, BrandKit } from "@/lib/editor/brandKit";
import { useToast } from "@/components/ui/ToastQueue";
import { triggerVibrate } from "@/lib/utils/device";

export function BrandKitSection() {
  const updateField = useEditorStore((state) => state.updateField);
  const palette = useEditorStore((state) => state.config.palette);
  const fontHeading = useEditorStore((state) => state.config.fontHeading);
  const fontBody = useEditorStore((state) => state.config.fontBody);
  const toast = useToast();
  const [kits, setKits] = useState<BrandKit[]>([]);

  useEffect(() => {
    setKits(getBrandKits());
  }, []);

  const save = () => {
    triggerVibrate(20);
    const next = saveBrandKit({
      name: `Kit ${kits.length + 1}`,
      palette,
      fontHeading,
      fontBody,
    });
    setKits(next);
    toast.success("Saved current colours & fonts as a Brand Kit");
  };

  const apply = (k: BrandKit) => {
    triggerVibrate(20);
    updateField("palette", k.palette);
    updateField("fontHeading", k.fontHeading);
    updateField("fontBody", k.fontBody);
    toast.success(`Applied ${k.name}`);
  };

  const remove = (id: string) => setKits(deleteBrandKit(id));

  return (
    <div className="space-y-3 pt-4 border-t border-border/40">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <Bookmark className="w-3.5 h-3.5 text-primary" /> Brand Kit
        </span>
        <button
          type="button"
          onClick={save}
          className="text-[11px] font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Save current
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground">Save your colours + fonts and apply them to any card in one tap.</p>

      {kits.length === 0 ? (
        <p className="text-[11px] text-muted-foreground italic">No kits yet, save your current style to reuse it.</p>
      ) : (
        <div className="space-y-2">
          {kits.map((k) => (
            <div key={k.id} className="flex items-center gap-2 p-2 rounded-xl border border-border bg-secondary/20">
              <div className="flex -space-x-1 shrink-0">
                {[k.palette.primary, k.palette.secondary, k.palette.accent].map((c, i) => (
                  <span key={i} className="w-4 h-4 rounded-full border border-card" style={{ background: c }} />
                ))}
              </div>
              <span className="flex-1 min-w-0 text-xs font-semibold truncate text-foreground">{k.name}</span>
              <button
                type="button"
                onClick={() => apply(k)}
                className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Apply
              </button>
              <button
                type="button"
                onClick={() => remove(k.id)}
                title="Delete kit"
                className="w-6 h-6 rounded-lg text-muted-foreground hover:text-destructive cursor-pointer flex items-center justify-center shrink-0"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BrandKitSection;
