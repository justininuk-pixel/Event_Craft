"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Users, Search, Link as LinkIcon, ExternalLink, Trash2, Plus } from "lucide-react";
import { useMyCollabs } from "@/lib/hooks/useSupabaseData";
import { useThemeSummaries } from "@/lib/themes/client";
import { EmptyState } from "@/components/ui/EmptyState";
import { supabase } from "@/lib/db/client";
import { authFetch } from "@/lib/utils/authFetch";
import { useToast } from "@/components/ui/ToastQueue";
import { useUserId } from "@/lib/hooks/useUserId";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CollabPage() {
  const toast = useToast();
  const userId = useUserId();
  const { data: collabs, loading, refetch } = useMyCollabs();
  const { summaries } = useThemeSummaries();
  const [searchQuery, setSearchQuery] = useState("");

  const themeNameById = useMemo(() => {
    const map = new Map<string, string>();
    summaries.forEach((s) => map.set(s.id, s.name));
    return map;
  }, [summaries]);
  const [contributorCounts, setContributorCounts] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auth/Role Gates
  const [isPro, setIsPro] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch Pro status
  useEffect(() => {
    if (!userId) return;
    const checkRole = async () => {
      try {
        const res = await fetch(`/api/auth/profile?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setIsPro(data.is_pro);
        }
      } catch (err) {
        console.error("Failed to check subscriber status:", err);
      } finally {
        setProfileLoading(false);
      }
    };
    checkRole();
  }, [userId]);

  // Fetch contribution counts for collaborative cards
  useEffect(() => {
    if (collabs.length === 0) return;
    
    const fetchCounts = async () => {
      const cardIds = collabs.map((c) => c.id);
      const { data, error } = await supabase
        .from("contributions")
        .select("card_id")
        .in("card_id", cardIds);
        
      if (!error && data) {
        const counts: Record<string, number> = {};
        cardIds.forEach((id) => {
          counts[id] = data.filter((item) => item.card_id === id).length;
        });
        setContributorCounts(counts);
      }
    };
    
    fetchCounts();
  }, [collabs]);

  const handleCopyInvite = (cardId: string) => {
    const host = window.location.host;
    const protocol = window.location.protocol;
    const url = `${protocol}//${host}/collab/${cardId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(cardId);
    toast.success("Invite link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateCollabClick = () => {
    if (userId?.startsWith("anon_")) {
      toast.info("Please Log In or Sign Up first to create Pro collaborations!");
      return;
    }
    if (!isPro) {
      setShowUpsellModal(true);
      return;
    }
    window.location.href = "/editor/funny-date-evade-neon?collab=true";
  };

  const triggerDeleteConfirm = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!deleteTargetId || !userId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/cards/${deleteTargetId}?userId=${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete card");
      }
      toast.success("Collaboration card deleted successfully.");
      setShowDeleteModal(false);
      setDeleteTargetId(null);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete collaboration");
    } finally {
      setDeleting(false);
    }
  };

  const executeMockUpgrade = async () => {
    if (userId?.startsWith("anon_")) return;
    try {
      const res = await authFetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, is_pro: true }),
      });
      if (res.ok) {
        setIsPro(true);
        setShowUpsellModal(false);
        toast.success("Pro Subscription unlocked! You can now create collaborative cards.");
      }
    } catch (err) {
      toast.error("Failed to upgrade subscription");
    }
  };

  const filteredCollabs = collabs.filter((card) => {
    const themeName = themeNameById.get(card.theme_id) ?? card.theme_id;
    const title = card.config?.title || "Celebration Card";
    const recipient = card.config?.recipient || "";
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      themeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipient.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:pl-64">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold font-heading text-foreground tracking-tight">Collaborations</h1>
            <p className="text-muted-foreground mt-1 font-medium">Build celebration cards together with friends and family.</p>
          </div>
          <Button onClick={handleCreateCollabClick} className="flex items-center gap-2 shadow-lg shadow-primary-glow shrink-0">
            <Plus className="w-4 h-4" /> Create Collab Card
          </Button>
        </div>

        <div className="relative mb-8">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search collaborations by title, theme, or recipient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/60 bg-card p-6">
                <div className="flex gap-4">
                  <Skeleton variant="image" className="w-16 h-16 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="40%" height={14} />
                    <Skeleton variant="text" width="30%" height={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCollabs.length === 0 ? (
          <EmptyState
            icon={<Users className="w-8 h-8" />}
            title={searchQuery ? "No matching collaborations" : "No collaborations yet"}
            description={searchQuery ? "Try refining your search query." : "Create a collaborative card and invite colleagues or family members to add their own custom messages."}
            actionText={searchQuery ? undefined : "Start Collaboration"}
            onAction={searchQuery ? undefined : handleCreateCollabClick}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCollabs.map((card) => {
              const themeName = themeNameById.get(card.theme_id) ?? card.theme_id;
              const title = card.config?.title || "Celebration Card";
              const recipient = card.config?.recipient || "Someone";
              const count = contributorCounts[card.id] || 0;

              return (
                <div key={card.id} className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-colors shadow-sm hover:shadow-md flex flex-col md:flex-row gap-4 items-start justify-between">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate text-foreground">{title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Theme: {themeName}</p>
                      <p className="text-sm font-semibold text-primary mt-1">For {recipient}</p>
                      <p className="text-xs text-muted-foreground mt-2 font-bold uppercase tracking-wider bg-secondary/40 px-2 py-0.5 rounded w-max">
                        {count} {count === 1 ? "contribution" : "contributions"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex md:flex-col items-stretch gap-2 w-full md:w-auto mt-4 md:mt-0 shrink-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleCopyInvite(card.id)}
                      className="text-xs h-9 flex items-center justify-center gap-1.5 flex-1 md:flex-none font-bold"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      {copiedId === card.id ? "Copied!" : "Copy Invite"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/c/${card.id}`, "_blank")}
                      className="text-xs h-9 flex items-center justify-center gap-1.5 flex-1 md:flex-none"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Card
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => triggerDeleteConfirm(card.id)}
                      className="text-xs h-9 bg-destructive/10 text-destructive hover:bg-destructive/20 shadow-none border-none flex items-center justify-center gap-1.5 flex-1 md:flex-none"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />

      {/* ==================== UPSELL MODAL ==================== */}

      <Modal
        isOpen={showUpsellModal}
        onClose={() => setShowUpsellModal(false)}
        title="Pro Subscription Required"
        description="Collaborative group cards are a CelebrationCraft Premium feature."
        size="sm"
      >
        <div className="text-center space-y-5 py-2">
          <span className="text-5xl block animate-bounce">⭐</span>
          <p className="text-sm text-muted-foreground">
            Get everyone involved! Invite unlimited contributors to add signatures, photos, and voice notes to a single card.
          </p>
          <Button 
            onClick={executeMockUpgrade}
            fullWidth
          >
            Upgrade to Pro (Mock)
          </Button>
          <Button 
            variant="ghost"
            onClick={() => setShowUpsellModal(false)}
            fullWidth
          >
            Maybe Later
          </Button>
        </div>
      </Modal>

      {/* ==================== DELETE MODAL ==================== */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Collaboration Card"
        description="Are you absolutely sure you want to delete this collaborative card?"
        size="sm"
      >
        <div className="space-y-5 py-2">
          <p className="text-sm text-destructive font-semibold bg-destructive/10 border border-destructive/20 p-3 rounded-xl">
            ⚠️ This will delete the card and all contributions made by friends and family. This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={executeDelete} 
              loading={deleting}
              className="flex-1"
            >
              Delete Card
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
