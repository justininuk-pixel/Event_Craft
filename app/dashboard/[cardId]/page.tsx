"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import clsx from "clsx";
import { ShareModal } from "@/components/editor/ShareModal";
import { ContributionsManager } from "@/components/dashboard/ContributionsManager";
import { Button } from "@/components/ui/Button";
import { triggerVibrate } from "@/lib/utils/device";

interface AnalyticsData {
  card: {
    id: string;
    themeId: string;
    config: any;
    deliveryStyle: string;
    isCollaborative: boolean;
    hasRsvp: boolean;
    viewCount: number;
    createdAt: string;
    expiresAt: string;
  };
  reactions: Array<{
    id: string;
    emoji: string;
    message?: string;
    display_name?: string;
    created_at: string;
  }>;
  reactionSummary: Array<{
    emoji: string;
    count: number;
  }>;
  contributions: Array<{
    id: string;
    display_name: string;
    message: string;
    photo_url?: string;
    voice_url?: string;
    created_at: string;
  }>;
  rsvps: Array<{
    id: string;
    name: string;
    response: "yes" | "no" | "maybe";
    guest_count: number;
    note?: string;
    created_at: string;
  }>;
}

function AnimatedNumber({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }

    const duration = 800; // ms
    const increment = end / (duration / 16); // ~60fps
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <>{count}</>;
}

function ReactionsChart({ data }: { data: Array<{ emoji: string; count: number }> }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="bg-card border border-border p-6 rounded-3xl space-y-4 shadow-sm">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
        Reaction Distribution
      </h3>
      <div className="space-y-3.5 pt-2">
        {data.map((item) => {
          const percent = (item.count / maxCount) * 100;
          return (
            <div key={item.emoji} className="flex items-center gap-3 text-xs">
              <span className="text-lg shrink-0 w-6 text-center select-none">{item.emoji}</span>
              <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                />
              </div>
              <span className="font-mono font-bold text-foreground w-8 text-right select-none">
                {item.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RsvpTable({ rsvps }: { rsvps: AnalyticsData["rsvps"] }) {
  const [sortField, setSortField] = useState<"name" | "response" | "guest_count">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const sortedRsvps = React.useMemo(() => {
    return [...rsvps].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB as string)
          : (valB as string).localeCompare(valA);
      }
      return sortOrder === "asc"
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });
  }, [rsvps, sortField, sortOrder]);

  const handleSort = (field: "name" | "response" | "guest_count") => {
    triggerVibrate(15);
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm w-full select-none">
      <div className="max-h-[300px] overflow-y-auto overflow-x-auto scrollbar-thin">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-secondary border-b border-border z-10 text-muted-foreground uppercase font-bold tracking-wider">
            <tr>
              <th
                onClick={() => handleSort("name")}
                className="px-4 py-3 cursor-pointer hover:bg-secondary/80 hover:text-foreground transition-colors"
              >
                Guest Name {sortField === "name" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th
                onClick={() => handleSort("response")}
                className="px-4 py-3 cursor-pointer hover:bg-secondary/80 hover:text-foreground transition-colors"
              >
                Status {sortField === "response" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th
                onClick={() => handleSort("guest_count")}
                className="px-4 py-3 cursor-pointer hover:bg-secondary/80 hover:text-foreground transition-colors"
              >
                Guests {sortField === "guest_count" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th className="px-4 py-3">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {sortedRsvps.map((rsvp) => (
              <tr key={rsvp.id} className="hover:bg-secondary/15 transition-colors text-foreground">
                <td className="px-4 py-3 font-semibold">{rsvp.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={clsx(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                      {
                        "bg-emerald-500/10 border-emerald-500/20 text-emerald-500": rsvp.response === "yes",
                        "bg-amber-500/10 border-amber-500/20 text-amber-500": rsvp.response === "maybe",
                        "bg-red-500/10 border-red-500/20 text-red-500": rsvp.response === "no",
                      }
                    )}
                  >
                    {rsvp.response === "yes" ? "Attending" : rsvp.response === "maybe" ? "Maybe" : "Declined"}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono font-bold">{rsvp.guest_count}</td>
                <td className="px-4 py-3 text-muted-foreground italic truncate max-w-[200px]" title={rsvp.note}>
                  {rsvp.note || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CreatorDashboardPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const cardId = params?.cardId as string;
  const secret = searchParams?.get("secret") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (!cardId || !secret) {
      setError("Missing card ID or security secret.");
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/cards/${cardId}/analytics?secret=${secret}`);
        if (!res.ok) {
          if (res.status === 403) {
            setError("Unauthorized. The secret token is incorrect.");
          } else {
            setError("Failed to fetch card analytics.");
          }
          return;
        }
        const analytics = await res.json();
        setData(analytics);
      } catch (err) {
        console.error(err);
        setError("An unexpected error occurred while loading dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [cardId, secret]);

  const handleExportCSV = () => {
    triggerVibrate(30);
    if (!data?.rsvps || data.rsvps.length === 0) return;

    const headers = ["Guest Name", "Response", "Guest Count", "Note", "Submitted At"];
    const rows = data.rsvps.map((rsvp) => [
      rsvp.name,
      rsvp.response,
      rsvp.guest_count,
      rsvp.note || "",
      new Date(rsvp.created_at).toLocaleString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rsvp_responses_${data.card.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-background text-foreground p-6 sm:p-8 space-y-8 select-none">
        <div className="w-full max-w-5xl mx-auto space-y-8">
          {/* Breadcrumbs skeleton */}
          <div className="h-4 w-48 bg-card rounded-md skeleton" />
          
          {/* Header skeleton */}
          <div className="h-24 w-full bg-card rounded-3xl skeleton" />
          
          {/* Stats grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-32 bg-card rounded-3xl skeleton" />
            <div className="h-32 bg-card rounded-3xl skeleton" />
            <div className="h-32 bg-card rounded-3xl skeleton" />
          </div>

          {/* Details sections skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="h-80 bg-card rounded-3xl skeleton" />
              <div className="h-80 bg-card rounded-3xl skeleton" />
            </div>
            <div className="h-96 bg-card rounded-3xl skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 select-none">
        <div className="bg-card border border-border p-8 rounded-3xl max-w-md text-center space-y-4 shadow-xl">
          <span className="text-4xl block animate-bounce">⚠️</span>
          <h2 className="text-lg font-black text-destructive font-heading">Access Denied</h2>
          <p className="text-xs text-muted-foreground">{error || "Could not retrieve analytics data."}</p>
          <Button onClick={() => router.push("/")} className="w-full font-bold">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  const { card, reactions, reactionSummary, contributions, rsvps } = data;
  const config = card.config;

  // Compute RSVP stats
  const goingRsvpCount = rsvps.filter((r) => r.response === "yes").reduce((sum, r) => sum + r.guest_count, 0);
  const maybeRsvpCount = rsvps.filter((r) => r.response === "maybe").reduce((sum, r) => sum + r.guest_count, 0);
  const declinedRsvpCount = rsvps.filter((r) => r.response === "no").length;

  const cardUrl = typeof window !== "undefined" ? `${window.location.origin}/c/${card.id}` : `/c/${card.id}`;
  const collabUrl = card.isCollaborative && typeof window !== "undefined" ? `${window.location.origin}/collab/${card.id}` : undefined;

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col font-sans select-none relative overflow-x-hidden p-4 sm:p-8">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl mx-auto space-y-6 z-10">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-muted-foreground select-none">
          <Link href="/" onClick={() => triggerVibrate(15)} className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-muted-foreground/60">Dashboard</span>
          <span>/</span>
          <span className="text-foreground font-bold truncate max-w-[200px]">{config.title || `Card for ${config.recipient}`}</span>
        </nav>

        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card/60 border border-border p-6 rounded-3xl backdrop-blur-md gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl select-none">📊</span>
              <h1 className="text-xl font-black text-foreground font-heading">Creator Analytics</h1>
            </div>
            <p className="text-xs text-muted-foreground">
              For card: <strong className="text-foreground">{config.title || `Card for ${config.recipient}`}</strong>
            </p>
          </div>

          <div className="flex gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                triggerVibrate(20);
                setShowShareModal(true);
              }}
              className="flex-1 sm:flex-initial px-4 py-2 h-10 rounded-xl bg-secondary border border-border text-xs font-bold hover:bg-muted transition flex items-center justify-center gap-1.5 focus-ring cursor-pointer"
            >
              Share / QR Code 🔗
            </button>
            <Link
              href={`/c/${card.id}`}
              onClick={() => triggerVibrate(20)}
              className="flex-1 sm:flex-initial px-4 py-2 h-10 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:brightness-110 shadow-sm transition text-center flex items-center justify-center gap-1.5 focus-ring"
            >
              View Live Card ➔
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card Views */}
          <div className="bg-card/80 border border-border p-6 rounded-3xl relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Total Views</span>
            <span className="text-3xl font-mono font-black text-primary mt-1 block">
              <AnimatedNumber value={card.viewCount} />
            </span>
            <span className="text-[10px] text-muted-foreground font-mono block mt-2">Created {new Date(card.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Emoji Reactions */}
          <div className="bg-card/80 border border-border p-6 rounded-3xl relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-accent" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Total Reactions</span>
            <span className="text-3xl font-mono font-black text-accent mt-1 block">
              <AnimatedNumber value={reactionSummary.reduce((sum, r) => sum + r.count, 0)} />
            </span>
            <span className="text-[10px] text-muted-foreground font-mono block mt-2">Active emojis: {reactionSummary.length}</span>
          </div>

          {/* RSVPs or Contributions */}
          <div className="bg-card/80 border border-border p-6 rounded-3xl relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
              {card.hasRsvp ? "RSVP Guest Total" : "Group Signers"}
            </span>
            <span className="text-3xl font-mono font-black text-emerald-500 mt-1 block">
              <AnimatedNumber value={card.hasRsvp ? goingRsvpCount + maybeRsvpCount : contributions.length} />
            </span>
            <span className="text-[10px] text-muted-foreground font-mono block mt-2">
              {card.hasRsvp
                ? `Going: ${goingRsvpCount} | Maybe: ${maybeRsvpCount} | Declined: ${declinedRsvpCount}`
                : `Collaborative: ${card.isCollaborative ? "Yes" : "No"}`}
            </span>
          </div>
        </div>

        {/* Dashboard Split Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Middle: Details Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Reactions Details Panel */}
            <div className="bg-card/40 border border-border p-6 rounded-3xl space-y-6 shadow-sm">
              
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Emoji Reactions Summary</h3>

                {reactionSummary.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No reactions left on this card yet.</p>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-2.5">
                      {reactionSummary.map((sum) => (
                        <span key={sum.emoji} className="px-3.5 py-1.5 bg-card border border-border rounded-xl flex items-center gap-2 text-sm shadow-sm select-none">
                          <span className="text-base">{sum.emoji}</span>
                          <span className="font-mono text-xs font-bold text-primary">{sum.count}</span>
                        </span>
                      ))}
                    </div>
                    {/* SVG Chart visualizer */}
                    <ReactionsChart data={reactionSummary} />
                  </div>
                )}
              </div>

              {/* Message replies list */}
              <div className="space-y-3.5 pt-4 border-t border-border/40">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Message Feed</span>
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                  {reactions.filter((r) => r.message || r.display_name).length === 0 ? (
                    <div className="py-6 text-center text-xs text-muted-foreground/60 italic bg-secondary/10 border border-dashed border-border rounded-2xl">
                      No short reply messages left yet.
                    </div>
                  ) : (
                    reactions
                      .filter((r) => r.message || r.display_name)
                      .map((r) => (
                        <div key={r.id} className="p-3.5 bg-card border border-border/75 rounded-2xl flex items-start justify-between gap-4 shadow-sm hover:border-border transition-colors">
                          <div className="space-y-1 min-w-0">
                            <span className="text-xs font-bold text-foreground block truncate">{r.display_name || "Anonymous"}</span>
                            <p className="text-xs text-muted-foreground leading-relaxed break-words">{r.message}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-lg select-none">{r.emoji}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {new Date(r.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* RSVP Responses (if enabled) */}
            {card.hasRsvp && (
              <div className="bg-card/40 border border-border p-6 rounded-3xl space-y-5 shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">RSVP Attendance List</h3>
                  {rsvps.length > 0 && (
                    <button
                      onClick={handleExportCSV}
                      className="px-3 py-1.5 h-8 rounded-lg bg-secondary border border-border text-[10px] font-bold hover:bg-muted transition flex items-center gap-1 cursor-pointer focus-ring"
                    >
                      Export CSV 📥
                    </button>
                  )}
                </div>

                {rsvps.length === 0 ? (
                  <div className="p-8 bg-card border border-border rounded-3xl text-center space-y-4">
                    <span className="text-4xl block select-none">🎫</span>
                    <h4 className="font-bold text-foreground">No RSVPs Yet</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                      No responses have been submitted for this card. Share the live card URL with guests to gather their attendance replies.
                    </p>
                  </div>
                ) : (
                  <RsvpTable rsvps={rsvps} />
                )}
              </div>
            )}

            {/* Collaborative contributions, manage (moderate, reorder, hide) */}
            {card.isCollaborative && (
              <ContributionsManager cardId={card.id} secret={secret} collabUrl={collabUrl} />
            )}
          </div>

          {/* Right Column: Card Configuration Card */}
          <div className="space-y-6">
            <div className="bg-card border border-border p-6 rounded-3xl space-y-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Card Configuration</h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-border/40">
                  <span className="text-muted-foreground">Theme Category</span>
                  <span className="font-bold text-foreground capitalize">{card.themeId.split("-")[0]}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/40">
                  <span className="text-muted-foreground">Delivery Animation</span>
                  <span className="font-bold text-foreground capitalize">{card.deliveryStyle}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/40">
                  <span className="text-muted-foreground">BGM Audio Preset</span>
                  <span className="font-bold text-foreground capitalize">{config.audioPreset}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/40">
                  <span className="text-muted-foreground">Collaborative Mode</span>
                  <span className="font-bold text-primary">{card.isCollaborative ? "Enabled 👥" : "Disabled"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/40">
                  <span className="text-muted-foreground">RSVP Gate</span>
                  <span className="font-bold text-emerald-500">{card.hasRsvp ? "Enabled 🎫" : "Disabled"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Expiry Date</span>
                  <span className="font-bold text-destructive">{new Date(card.expiresAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-secondary/15 border border-border p-5 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest select-none">💡 Dashboard Tip</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Bookmark this page URL now! The URL contains your private <code className="bg-secondary px-1 py-0.5 rounded text-[10px] font-mono">secret</code> token key. Do not share this URL with anyone else unless you want them to see the analytics.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showShareModal && (
        <ShareModal
          isOpen={true}
          onClose={() => setShowShareModal(false)}
          cardUrl={cardUrl}
          collabUrl={collabUrl}
          themeEmoji="📊"
          creatorSecret={secret}
          cardId={card.id}
        />
      )}
    </div>
  );
}
