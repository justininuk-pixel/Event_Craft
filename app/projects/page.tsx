"use client";

import React, { useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Search, Clock, Eye, Trash2, ExternalLink, FolderOpen, Plus, Share2, Users, LayoutGrid, List, SortAsc } from "lucide-react";
import { useMyCards } from "@/lib/hooks/useSupabaseData";
import { useThemeSummaries } from "@/lib/themes/client";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/ToastQueue";
import { useUserId } from "@/lib/hooks/useUserId";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type SortOption = "newest" | "oldest" | "views";
type ViewMode = "grid" | "list";

export default function ProjectsPage() {
  const toast = useToast();
  const userId = useUserId();
  const { data: cards, loading, refetch } = useMyCards();
  const { summaries } = useThemeSummaries();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const themeNameById = useMemo(() => {
    const map = new Map<string, { name: string; emoji: string }>();
    summaries.forEach((s) => map.set(s.id, { name: s.name, emoji: s.emoji }));
    return map;
  }, [summaries]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalViews = useMemo(() => cards.reduce((sum, c) => sum + (c.view_count || 0), 0), [cards]);
  const collabCount = useMemo(() => cards.filter(c => c.is_collaborative).length, [cards]);

  const triggerDeleteConfirm = (id: string) => { setDeleteTargetId(id); setShowDeleteModal(true); };

  const executeDelete = async () => {
    if (!deleteTargetId || !userId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/cards/${deleteTargetId}?userId=${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete card");
      }
      toast.success("Project deleted successfully.");
      setShowDeleteModal(false);
      setDeleteTargetId(null);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = (cardId: string) => {
    const url = `${window.location.origin}/c/${cardId}`;
    navigator.clipboard.writeText(url).then(() => toast.success("Link copied to clipboard!")).catch(() => toast.error("Failed to copy link"));
  };

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const themeInfo = themeNameById.get(card.theme_id);
      const themeName = themeInfo?.name ?? card.theme_id;
      const title = card.config?.title || "Celebration Card";
      const recipient = card.config?.recipient || "";
      const sender = card.config?.sender || "";
      return (
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        themeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sender.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [cards, searchQuery, themeNameById]);

  const sortedCards = useMemo(() => {
    return [...filteredCards].sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "views") return (b.view_count || 0) - (a.view_count || 0);
      return 0;
    });
  }, [filteredCards, sortBy]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:pl-64">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold font-heading text-foreground tracking-tight">My Projects</h1>
            <p className="text-muted-foreground mt-1 font-medium">View and manage all your celebration cards.</p>
          </div>
          <Button onClick={() => window.location.href = "/explore"} className="flex items-center gap-2 shadow-lg shadow-primary-glow shrink-0">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </div>

        {/* Stats Bar */}
        {!loading && cards.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total Cards", value: cards.length, icon: <FolderOpen className="w-4 h-4 text-primary" /> },
              { label: "Total Views", value: totalViews, icon: <Eye className="w-4 h-4 text-emerald-500" /> },
              { label: "Collaborative", value: collabCount, icon: <Users className="w-4 h-4 text-blue-500" /> },
            ].map((stat) => (
              <div key={stat.label} className="bg-card border border-border/50 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">{stat.icon}</div>
                <div>
                  <p className="text-xl font-extrabold font-heading leading-none">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search + Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title, recipient, or theme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-card border border-border/60 rounded-xl p-1">
              <SortAsc className="w-3.5 h-3.5 text-muted-foreground ml-1.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-xs font-bold text-foreground pr-2 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>
            <div className="flex items-center gap-0.5 bg-card border border-border/60 rounded-xl p-1">
              <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === "grid" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === "list" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-3"}>
            {Array.from({ length: 6 }).map((_, i) => (
              viewMode === "grid" ? (
                <div key={i} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                  <Skeleton variant="image" className="aspect-[3/2] rounded-none" />
                  <div className="p-5 space-y-3">
                    <Skeleton variant="text" width="70%" height={22} />
                    <Skeleton variant="text" width="40%" height={16} />
                    <Skeleton variant="text" width="100%" height={36} className="rounded-xl mt-4" />
                  </div>
                </div>
              ) : (
                <div key={i} className="h-20 rounded-2xl bg-card border border-border/60 animate-pulse" />
              )
            ))}
          </div>
        ) : sortedCards.length === 0 ? (
          <EmptyState
            icon={<FolderOpen className="w-8 h-8" />}
            title={searchQuery ? "No matching projects" : "No projects yet"}
            description={searchQuery ? "Try refining your search terms." : "Browse themes and create your first celebration card."}
            actionText={searchQuery ? undefined : "Browse Themes"}
            onAction={searchQuery ? undefined : () => window.location.href = "/explore"}
          />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCards.map((card) => {
              const themeInfo = themeNameById.get(card.theme_id);
              const themeName = themeInfo?.name ?? card.theme_id;
              const themeEmoji = themeInfo?.emoji ?? "🎉";
              const title = card.config?.title || "Celebration Card";
              const recipient = card.config?.recipient || "Someone";
              const views = card.view_count || 0;

              return (
                <div key={card.id} className="bg-card border border-border/60 rounded-2xl overflow-hidden group hover:border-primary/50 hover:shadow-primary-glow hover:-translate-y-1 transition-all duration-300 shadow-sm flex flex-col">
                  <div className="aspect-[3/2] bg-gradient-to-br from-primary/10 via-secondary to-accent/10 relative flex items-center justify-center border-b border-border/40 overflow-hidden">
                    <span className="text-6xl group-hover:scale-110 transition-transform duration-500 drop-shadow-sm select-none">{themeEmoji}</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    {card.is_collaborative && (
                      <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-extrabold bg-blue-500/90 text-white rounded-full shadow-sm flex items-center gap-1">
                        <Users className="w-2.5 h-2.5" /> Collab
                      </span>
                    )}
                    <button
                      onClick={() => handleShare(card.id)}
                      className="absolute top-3 right-3 w-7 h-7 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer"
                      title="Copy share link"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col gap-3">
                    <div>
                      <h3 className="font-extrabold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 font-medium">{themeName}</p>
                      <p className="text-sm font-bold text-primary mt-1.5">For {recipient}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground font-medium mt-auto">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatEventDate(card.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{views} views</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="primary" size="sm" fullWidth onClick={() => window.open(`/c/${card.id}`, "_blank")} className="flex items-center justify-center gap-1.5 text-xs font-bold">
                        <ExternalLink className="w-3.5 h-3.5" /> View Card
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => window.location.href = `/editor/${card.theme_id}`} className="text-xs font-bold shrink-0">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleShare(card.id)} className="p-2 min-h-0 h-9 shrink-0" title="Copy share link">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => triggerDeleteConfirm(card.id)} className="p-2 min-h-0 h-9 bg-destructive/10 text-destructive hover:bg-destructive/20 shadow-none border-none shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {sortedCards.map((card) => {
              const themeInfo = themeNameById.get(card.theme_id);
              const themeName = themeInfo?.name ?? card.theme_id;
              const themeEmoji = themeInfo?.emoji ?? "🎉";
              const title = card.config?.title || "Celebration Card";
              const recipient = card.config?.recipient || "Someone";
              const views = card.view_count || 0;

              return (
                <div key={card.id} className="bg-card border border-border/60 rounded-2xl p-4 flex items-center gap-4 hover:border-primary/50 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 via-secondary to-accent/10 flex items-center justify-center shrink-0 text-2xl">
                    {themeEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-sm text-foreground truncate group-hover:text-primary transition-colors">{title}</h3>
                    <p className="text-xs text-muted-foreground">For {recipient} · {themeName}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatEventDate(card.created_at)}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{views} views</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button variant="primary" size="sm" onClick={() => window.open(`/c/${card.id}`, "_blank")} className="text-xs font-bold hidden sm:flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShare(card.id)} className="p-2 min-h-0 h-8" title="Copy link">
                      <Share2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => triggerDeleteConfirm(card.id)} className="p-2 min-h-0 h-8 bg-destructive/10 text-destructive hover:bg-destructive/20 shadow-none border-none">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Card Project" description="Are you sure you want to permanently delete this card project?" size="sm">
        <div className="space-y-5 py-2">
          <p className="text-sm text-muted-foreground">
            This card will be permanently deleted. Any shared links will stop working and all associated messages will be removed.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1">Cancel</Button>
            <Button variant="danger" onClick={executeDelete} loading={deleting} className="flex-1">Delete Project</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
