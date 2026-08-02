"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CalendarDays, Plus, Edit, Trash2, Globe, Cake, Heart, GraduationCap, Star, Gift, Timer, Clock, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useMyCalendarEvents } from "@/lib/hooks/useSupabaseData";
import { AddEventModal } from "@/components/schedule/AddEventModal";
import { supabase } from "@/lib/db/client";
import { useToast } from "@/components/ui/ToastQueue";
import { useUserId } from "@/lib/hooks/useUserId";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

function getEventIcon(type: string) {
  const lower = (type || "").toLowerCase();
  if (lower.includes("birthday")) return <Cake className="w-4 h-4" />;
  if (lower.includes("wedding")) return <Heart className="w-4 h-4" />;
  if (lower.includes("anniversary")) return <Heart className="w-4 h-4" />;
  if (lower.includes("graduation")) return <GraduationCap className="w-4 h-4" />;
  if (lower.includes("baby") || lower.includes("shower")) return <Gift className="w-4 h-4" />;
  if (lower.includes("holiday")) return <Star className="w-4 h-4" />;
  if (lower.includes("party") || lower.includes("celebration")) return <PartyPopper className="w-4 h-4" />;
  return <CalendarDays className="w-4 h-4" />;
}

function getEventColors(type: string): { badge: string; accent: string; bg: string } {
  const lower = (type || "").toLowerCase();
  if (lower.includes("birthday")) return { badge: "bg-rose-500/20 text-rose-400 border-rose-500/30", accent: "border-l-rose-500", bg: "bg-rose-500/5" };
  if (lower.includes("wedding")) return { badge: "bg-purple-500/20 text-purple-400 border-purple-500/30", accent: "border-l-purple-500", bg: "bg-purple-500/5" };
  if (lower.includes("anniversary")) return { badge: "bg-blue-500/20 text-blue-400 border-blue-500/30", accent: "border-l-blue-500", bg: "bg-blue-500/5" };
  if (lower.includes("graduation")) return { badge: "bg-green-500/20 text-green-400 border-green-500/30", accent: "border-l-green-500", bg: "bg-green-500/5" };
  if (lower.includes("baby") || lower.includes("shower")) return { badge: "bg-pink-500/20 text-pink-400 border-pink-500/30", accent: "border-l-pink-500", bg: "bg-pink-500/5" };
  if (lower.includes("holiday")) return { badge: "bg-amber-500/20 text-amber-400 border-amber-500/30", accent: "border-l-amber-500", bg: "bg-amber-500/5" };
  if (lower.includes("party") || lower.includes("celebration")) return { badge: "bg-violet-500/20 text-violet-400 border-violet-500/30", accent: "border-l-violet-500", bg: "bg-violet-500/5" };
  return { badge: "bg-secondary text-muted-foreground border-border/60", accent: "border-l-border", bg: "bg-secondary/30" };
}

function getCountdownLabel(dateStr: string, now: Date): { label: string; urgent: boolean; past: boolean } {
  if (!dateStr) return { label: "No date", urgent: false, past: false };
  const event = new Date(dateStr);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventStart = new Date(event.getFullYear(), event.getMonth(), event.getDate());
  const diffDays = Math.round((eventStart.getTime() - todayStart.getTime()) / 86400000);

  if (diffDays < 0) return { label: `${Math.abs(diffDays)} days ago`, urgent: false, past: true };
  if (diffDays === 0) return { label: "Today!", urgent: true, past: false };
  if (diffDays === 1) return { label: "Tomorrow", urgent: true, past: false };
  if (diffDays <= 7) return { label: `In ${diffDays} days`, urgent: true, past: false };
  if (diffDays <= 30) return { label: `In ${diffDays} days`, urgent: false, past: false };
  const months = Math.round(diffDays / 30);
  return { label: `In ${months} month${months > 1 ? "s" : ""}`, urgent: false, past: false };
}

function formatEventDate(dateStr: string): string {
  if (!dateStr) return "No date";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

export default function SchedulePage() {
  const toast = useToast();
  const userId = useUserId();
  const { data: events, loading, refetch } = useMyCalendarEvents();
  const [now] = useState<Date>(() => new Date());

  const [activeTab, setActiveTab] = useState<"personal" | "global">("personal");
  const [isAdmin, setIsAdmin] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<any | null>(null);

  const [globalModalOpen, setGlobalModalOpen] = useState(false);
  const [globalTitle, setGlobalTitle] = useState("");
  const [globalMode, setGlobalMode] = useState<"fixed" | "rule">("fixed");
  const [globalMonth, setGlobalMonth] = useState("1");
  const [globalDay, setGlobalDay] = useState("1");
  const [globalRule, setGlobalRule] = useState("Second Sunday in May");
  const [globalLoading, setGlobalLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; isGlobal: boolean; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const checkRole = async () => {
      try {
        const res = await fetch(`/api/auth/profile?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.is_admin);
        }
      } catch (err) {
        console.error("Failed to check admin status:", err);
      }
    };
    checkRole();
  }, [userId]);

  const triggerDeleteConfirm = (id: string, isGlobal: boolean, title: string) => {
    setDeleteTarget({ id, isGlobal, title });
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!deleteTarget || !userId) return;
    setDeleting(true);
    try {
      if (deleteTarget.isGlobal) {
        const cleanId = deleteTarget.id.replace("global-", "");
        const res = await fetch(`/api/admin/global-events?userId=${userId}&id=${cleanId}`, { method: "DELETE" });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to delete global holiday");
        }
        toast.success("Global holiday deleted successfully.");
      } else {
        const { error } = await supabase.from("calendar_events").delete().eq("id", deleteTarget.id).eq("user_id", userId);
        if (error) throw error;
        toast.success("Event deleted successfully.");
      }
      setShowDeleteModal(false);
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete event");
    } finally {
      setDeleting(false);
    }
  };

  const handleEditClick = (event: any) => { setEventToEdit(event); setModalOpen(true); };
  const handleAddClick = () => { setEventToEdit(null); setModalOpen(true); };

  const handleAddGlobalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalTitle.trim()) { toast.error("Please enter a holiday title"); return; }
    setGlobalLoading(true);
    try {
      const payload = {
        title: globalTitle,
        month: globalMode === "fixed" ? Number(globalMonth) : null,
        day: globalMode === "fixed" ? Number(globalDay) : null,
        rule: globalMode === "rule" ? globalRule : null
      };
      const res = await fetch(`/api/admin/global-events?userId=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to add global holiday");
      }
      toast.success("Global holiday added successfully!");
      setGlobalModalOpen(false);
      setGlobalTitle("");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to add global holiday");
    } finally {
      setGlobalLoading(false);
    }
  };

  const personalEvents = events.filter((e) => !e.is_global);
  const globalEvents = events.filter((e) => e.is_global);

  const sortedDisplayEvents = useMemo(() => {
    const list = activeTab === "personal" ? personalEvents : globalEvents;
    const todayMs = now.getTime();
    return [...list].sort((a, b) => {
      const da = a.event_date ? new Date(a.event_date).getTime() : Infinity;
      const db = b.event_date ? new Date(b.event_date).getTime() : Infinity;
      const futureA = da >= todayMs ? da : Infinity;
      const futureB = db >= todayMs ? db : Infinity;
      if (futureA !== Infinity || futureB !== Infinity) {
        if (futureA === Infinity && futureB !== Infinity) return 1;
        if (futureA !== Infinity && futureB === Infinity) return -1;
        return futureA - futureB;
      }
      return db - da;
    });
  }, [activeTab, personalEvents, globalEvents, now]);

  const nextEvent = useMemo(() => {
    return sortedDisplayEvents.find((e) => e.event_date && new Date(e.event_date).getTime() >= now.getTime());
  }, [sortedDisplayEvents, now]);

  const upcomingCount = sortedDisplayEvents.filter((e) => e.event_date && new Date(e.event_date).getTime() >= now.getTime()).length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:pl-64">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold font-heading text-foreground tracking-tight">Schedule</h1>
            <p className="text-muted-foreground mt-1 font-medium">
              {upcomingCount > 0 ? `${upcomingCount} upcoming celebration${upcomingCount > 1 ? "s" : ""}` : "Manage your events and celebrations."}
            </p>
          </div>
          <div className="flex gap-2">
            {activeTab === "global" && isAdmin && (
              <Button onClick={() => setGlobalModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500">
                <Plus className="w-4 h-4" /> Add Global Date
              </Button>
            )}
            <Button onClick={handleAddClick} className="flex items-center gap-2 shadow-lg shadow-primary-glow">
              <Plus className="w-4 h-4" /> Add Event
            </Button>
          </div>
        </div>

        {/* Next Event Highlight */}
        {!loading && activeTab === "personal" && nextEvent && (
          <div className="mb-6 p-5 rounded-2xl border border-primary/30 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Timer className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-0.5">Next Up</p>
                <h3 className="text-base font-extrabold text-foreground">{nextEvent.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {formatEventDate(nextEvent.event_date)}
                </p>
              </div>
            </div>
            <div className="sm:text-right">
              <p className="text-2xl font-extrabold font-heading text-primary leading-tight">
                {getCountdownLabel(nextEvent.event_date, now).label}
              </p>
              <span className={`text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getEventColors(nextEvent.event_type).badge}`}>
                {nextEvent.event_type}
              </span>
            </div>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex border-b border-border/60 mb-6">
          <button
            onClick={() => setActiveTab("personal")}
            className={`px-6 py-2.5 font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "personal" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            My Schedule ({personalEvents.length})
          </button>
          <button
            onClick={() => setActiveTab("global")}
            className={`px-6 py-2.5 font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "global" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="w-4 h-4" />
            International Holidays ({globalEvents.length})
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-card border border-border/60 animate-pulse" />
            ))}
          </div>
        ) : sortedDisplayEvents.length === 0 ? (
          <EmptyState
            icon={activeTab === "personal" ? <CalendarDays className="w-8 h-8" /> : <Globe className="w-8 h-8" />}
            title={activeTab === "personal" ? "No custom events scheduled" : "No global holidays loaded"}
            description={
              activeTab === "personal"
                ? "Add birthdays, weddings, anniversaries, and other milestones to keep track."
                : "No international holidays are currently configured."
            }
            actionText={activeTab === "personal" ? "Add First Event" : (isAdmin ? "Add Global Date" : undefined)}
            onAction={activeTab === "personal" ? handleAddClick : (isAdmin ? () => setGlobalModalOpen(true) : undefined)}
          />
        ) : (
          <div className="space-y-2.5">
            {sortedDisplayEvents.map((item) => {
              const countdown = getCountdownLabel(item.event_date, now);
              const colors = getEventColors(item.event_type);
              const icon = getEventIcon(item.event_type);

              return (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 rounded-2xl border border-border/50 border-l-4 ${colors.accent} ${colors.bg} hover:border-primary/30 transition-all group`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colors.badge}`}>
                      {icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-base font-bold text-foreground truncate">{item.title}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                          <Clock className="w-3 h-3" />
                          {formatEventDate(item.event_date)}
                        </span>
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${colors.badge}`}>
                          {item.event_type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    <div className="text-right">
                      <p className={`text-sm font-extrabold ${countdown.past ? "text-muted-foreground" : countdown.urgent ? "text-primary" : "text-foreground"}`}>
                        {countdown.label}
                      </p>
                    </div>

                    {!item.is_global ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(item)} className="p-2 min-h-0 h-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => triggerDeleteConfirm(item.id, false, item.title)} className="p-2 min-h-0 h-8 bg-destructive/10 text-destructive hover:bg-destructive/20 shadow-none border-none opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          className="h-8 text-xs font-bold shrink-0"
                          onClick={() => window.location.href = `/explore?kind=experiences`}
                        >
                          Create Card
                        </Button>
                      </>
                    ) : (
                      isAdmin && (
                        <Button variant="danger" size="sm" onClick={() => triggerDeleteConfirm(item.id, true, item.title)} className="p-2 min-h-0 h-8 bg-destructive/10 text-destructive hover:bg-destructive/20 shadow-none border-none">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />

      <AddEventModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={refetch} eventToEdit={eventToEdit} />

      <Modal isOpen={globalModalOpen} onClose={() => setGlobalModalOpen(false)} title="Create Global Holiday" description="Add a calendar date that is visible internationally to all users." size="sm">
        <form onSubmit={handleAddGlobalSubmit} className="space-y-4">
          <Input label="Holiday Title" placeholder="e.g. Earth Day" value={globalTitle} onChange={(e) => setGlobalTitle(e.target.value)} required />
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-semibold text-muted-foreground">Date Mode</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="radio" name="globalMode" checked={globalMode === "fixed"} onChange={() => setGlobalMode("fixed")} />
                Fixed Date (e.g. 22 April)
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="radio" name="globalMode" checked={globalMode === "rule"} onChange={() => setGlobalMode("rule")} />
                Relative Rule (e.g. Second Sunday)
              </label>
            </div>
          </div>
          {globalMode === "fixed" ? (
            <div className="grid grid-cols-2 gap-4">
              <Select label="Month" value={globalMonth} onChange={(val) => setGlobalMonth(val)} options={[
                { value: "1", label: "January" }, { value: "2", label: "February" }, { value: "3", label: "March" },
                { value: "4", label: "April" }, { value: "5", label: "May" }, { value: "6", label: "June" },
                { value: "7", label: "July" }, { value: "8", label: "August" }, { value: "9", label: "September" },
                { value: "10", label: "October" }, { value: "11", label: "November" }, { value: "12", label: "December" },
              ]} />
              <Input label="Day" type="number" min={1} max={31} value={globalDay} onChange={(e) => setGlobalDay(e.target.value)} required />
            </div>
          ) : (
            <Select label="Relative Rule Schema" value={globalRule} onChange={(val) => setGlobalRule(val)} options={[
              { value: "Second Sunday in May", label: "Second Sunday in May (Mother's Day)" },
              { value: "Third Sunday in June", label: "Third Sunday in June (Father's Day)" },
              { value: "Fourth Thursday of November", label: "Fourth Thursday of November (Thanksgiving)" },
            ]} />
          )}
          <Button type="submit" fullWidth loading={globalLoading}>Create Holiday</Button>
        </form>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title={deleteTarget?.isGlobal ? "Delete Global Holiday" : "Delete Event"} description={`Are you sure you want to delete "${deleteTarget?.title}"?`} size="sm">
        <div className="space-y-5 py-2">
          <p className="text-sm text-muted-foreground">
            {deleteTarget?.isGlobal
              ? "This will permanently remove this holiday from the calendar for ALL users system-wide."
              : "This event will be removed from your personal schedule."}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1">Cancel</Button>
            <Button variant="danger" onClick={executeDelete} loading={deleting} className="flex-1">Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
