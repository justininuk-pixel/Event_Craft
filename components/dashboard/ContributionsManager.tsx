"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Users } from "lucide-react";
import { Contribution } from "@/lib/themes/types";
import { useRealtimeContributions } from "@/lib/hooks/useRealtimeContributions";
import { triggerVibrate } from "@/lib/utils/device";
import { useToast } from "@/components/ui/ToastQueue";
import { Button } from "@/components/ui/Button";

interface ContributionsManagerProps {
  cardId: string;
  secret: string;
  collabUrl?: string;
}

/**
 * Creator moderation panel for a collaborative card's contributions.
 * Live (realtime + polling); supports delete, hide/show and reorder.
 */
export function ContributionsManager({ cardId, secret, collabUrl }: ContributionsManagerProps) {
  const { contributions, setContributions, refetch } = useRealtimeContributions(cardId, []);
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  const ordered = [...contributions].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.created_at.localeCompare(b.created_at)
  );

  const del = async (id: string) => {
    triggerVibrate(30);
    setBusy(id);
    setContributions((prev) => prev.filter((c) => c.id !== id));
    try {
      const res = await fetch(`/api/cards/${cardId}/contributions/${id}?secret=${encodeURIComponent(secret)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Contribution removed");
    } catch {
      toast.error("Couldn't remove — restoring");
      refetch();
    } finally {
      setBusy(null);
    }
  };

  const toggleHide = async (c: Contribution) => {
    triggerVibrate(20);
    const next = c.status === "hidden" ? "approved" : "hidden";
    setBusy(c.id);
    setContributions((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: next } : x)));
    try {
      const res = await fetch(`/api/cards/${cardId}/contributions/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, status: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      toast.error("Hide/show needs the latest DB migration applied");
      refetch();
    } finally {
      setBusy(null);
    }
  };

  const reorder = async (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= ordered.length) return;
    triggerVibrate(15);
    const arr = [...ordered];
    [arr[index], arr[j]] = [arr[j], arr[index]];
    const updated = arr.map((c, i) => ({ ...c, sort_order: i }));
    setContributions(updated);
    try {
      await Promise.all(
        updated.map((c) =>
          fetch(`/api/cards/${cardId}/contributions/${c.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ secret, sort_order: c.sort_order }),
          })
        )
      );
    } catch {
      refetch();
    }
  };

  return (
    <div className="bg-card/40 border border-border p-6 rounded-3xl space-y-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" /> Manage Contributions ({ordered.length})
        </h3>
        {collabUrl && (
          <Button
            variant="outline"
            size="sm"
            className="text-[11px] font-bold"
            onClick={() => {
              triggerVibrate(20);
              navigator.clipboard.writeText(collabUrl);
              toast.success("Contributor link copied");
            }}
          >
            Copy invite link 📋
          </Button>
        )}
      </div>

      {ordered.length === 0 ? (
        <div className="p-8 bg-card border border-border rounded-3xl text-center space-y-3">
          <span className="text-4xl block select-none">👥</span>
          <h4 className="font-bold text-foreground">No contributions yet</h4>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Share the contributor link so friends can add their messages, photos and signatures.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {ordered.map((c, i) => {
            const hidden = c.status === "hidden";
            return (
              <li
                key={c.id}
                className={clsx(
                  "p-3.5 bg-card border rounded-2xl flex items-start gap-3 transition-opacity",
                  hidden ? "border-border/50 opacity-50" : "border-border/80"
                )}
              >
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => reorder(i, -1)}
                    disabled={i === 0}
                    className="w-6 h-6 rounded-md border border-border text-muted-foreground hover:text-foreground disabled:opacity-25 cursor-pointer flex items-center justify-center"
                    title="Move up"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => reorder(i, 1)}
                    disabled={i === ordered.length - 1}
                    className="w-6 h-6 rounded-md border border-border text-muted-foreground hover:text-foreground disabled:opacity-25 cursor-pointer flex items-center justify-center"
                    title="Move down"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary truncate">{c.display_name || "Someone"}</span>
                    {hidden && <span className="text-[9px] font-bold uppercase text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">Hidden</span>}
                    {c.photo_url && <span className="text-[10px]" title="Has photo">🖼️</span>}
                    {c.voice_url && <span className="text-[10px]" title="Has voice note">🎙️</span>}
                    {c.signature && <span className="text-[10px]" title="Has drawing">✍️</span>}
                  </div>
                  {c.message && <p className="text-xs text-muted-foreground leading-relaxed break-words mt-1">{c.message}</p>}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleHide(c)}
                    disabled={busy === c.id}
                    className="w-7 h-7 rounded-lg border border-border text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center disabled:opacity-40"
                    title={hidden ? "Show" : "Hide"}
                  >
                    {hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => del(c.id)}
                    disabled={busy === c.id}
                    className="w-7 h-7 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 cursor-pointer flex items-center justify-center disabled:opacity-40"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ContributionsManager;
