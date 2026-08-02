"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Sparkles, Smile, Users, Calendar, Eye, Share2 } from "lucide-react";
import { useDashboardSummary } from "@/lib/hooks/useSupabaseData";
import { useUserId } from "@/lib/hooks/useUserId";
import { useThemeRows } from "@/lib/themes/client";
import { ThemeRow } from "@/components/gallery/ThemeRow";
import { EmptyState } from "@/components/ui/EmptyState";

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  const tomorrow = new Date(Date.now() + 86400000);
  if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function DashboardWidgets() {
  const userId = useUserId();
  const { rows, loading: rowsLoading } = useThemeRows(userId);
  const { data: summary, loading: summaryLoading } = useDashboardSummary();
  const { analytics, reactions, collabs, calendarEvents } = summary;

  const analyticsLoading = summaryLoading;
  const reactionsLoading = summaryLoading;
  const collabsLoading = summaryLoading;
  const calendarLoading = summaryLoading;

  // Stable mount timestamp (lazy initializer keeps Date.now() off the render path)
  const [nowTs] = useState(() => Date.now());

  // Filter future and current day events for upcoming schedule
  const upcomingEvents = calendarEvents
    .filter((event) => new Date(event.event_date).getTime() >= nowTs - 86400000)
    .slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Main Column (2/3 width) */}
      <div className="lg:col-span-2 space-y-8">
        {/* Personalized theme rails — a few curated picks per row, scroll for more */}
        <section className="space-y-8">
          {rowsLoading ? (
            Array.from({ length: 2 }).map((_, rowIdx) => (
              <div key={rowIdx} className="space-y-3">
                <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                <div className="flex gap-4 overflow-hidden">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-[240px] sm:w-[260px] shrink-0 aspect-[4/5] rounded-3xl bg-card border border-border/60 animate-pulse" />
                  ))}
                </div>
              </div>
            ))
          ) : (
            rows.map((row) => <ThemeRow key={row.id} row={row} />)
          )}
        </section>

        {/* Analytics Snapshot */}
        <section>
          <h2 className="text-2xl tracking-tight font-bold font-heading mb-6 text-foreground/90">Analytics Snapshot</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analyticsLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-border/60 bg-card animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-8 bg-muted rounded w-1/2" />
                </div>
              ))
            ) : (
              [
                { label: "Total Projects", value: analytics.totalCards, icon: <Sparkles className="w-12 h-12" /> },
                { label: "Total Views", value: analytics.totalViews, icon: <Eye className="w-12 h-12" /> },
                { label: "Reactions", value: analytics.totalReactions, icon: <Smile className="w-12 h-12" /> },
                { label: "Shares", value: analytics.totalShares, icon: <Share2 className="w-12 h-12" /> },
              ].map((stat) => (
                <div key={stat.label} className="p-5 rounded-2xl border border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    {stat.icon}
                  </div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-extrabold font-heading mt-2">{stat.value}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Right Sidebar Column (1/3 width) */}
      <div className="space-y-6">
        {/* Upcoming Scheduled Celebrations */}
        <section className="p-6 md:p-8 rounded-3xl border border-border/60 bg-card shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl tracking-tight font-bold font-heading">Upcoming Schedule</h2>
            <Link href="/schedule" className="text-xs text-primary font-bold hover:underline bg-primary/10 px-2 py-1 rounded-md">Manage</Link>
          </div>
          <div className="space-y-3">
            {calendarLoading ? (
              <div className="text-center text-sm text-muted-foreground py-4">Loading schedule...</div>
            ) : upcomingEvents.length === 0 ? (
              <EmptyState
                icon={<Calendar className="w-8 h-8" />}
                title="No upcoming events"
                description="Schedule an event to keep track of birthdays, weddings, or milestones!"
                actionText="Add Event"
                onAction={() => window.location.href = "/schedule"}
              />
            ) : (
              upcomingEvents.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border bg-secondary/30 border-border/40 hover:border-border transition-colors">
                  <div>
                    <h4 className="text-sm font-bold">{item.title}</h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground font-medium">{formatEventDate(item.event_date)}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 bg-background rounded-lg text-muted-foreground border border-border/60 shadow-sm">
                    {item.event_type}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recent Reactions */}
        <section className="p-6 md:p-8 rounded-3xl border border-border/60 bg-card shadow-md">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl tracking-tight font-bold font-heading">Recent Reactions</h2>
            <Link href="/analytics" className="text-xs text-primary font-bold hover:underline bg-primary/10 px-2 py-1 rounded-md">View All</Link>
          </div>
          <div className="space-y-4">
            {reactionsLoading ? (
              <div className="text-center text-sm text-muted-foreground py-4">Loading reactions...</div>
            ) : reactions.length === 0 ? (
              <EmptyState
                icon={<Smile className="w-8 h-8" />}
                title="No reactions yet"
                description="Create and share cards to see reactions from recipients here!"
                actionText="Explore Themes"
                onAction={() => window.location.href = "/explore"}
              />
            ) : (
              reactions.slice(0, 4).map((reaction, i) => {
                const cardTitle = reaction.cards?.config?.title || "Celebration Card";
                return (
                  <div key={i} className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0">
                      {(reaction.display_name || "Someone").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between">
                        <p className="text-sm font-bold truncate">{reaction.display_name || "Someone"}</p>
                        <span className="text-[10px] text-muted-foreground font-medium">{formatTimeAgo(reaction.created_at)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate font-medium mt-0.5">on &quot;{cardTitle}&quot;</p>
                      {reaction.message && (
                        <p className="text-xs text-foreground/80 italic mt-1 border-l-2 border-primary/30 pl-2 line-clamp-1">
                          &quot;{reaction.message}&quot;
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 drop-shadow-sm text-xl">{reaction.emoji}</div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Collaboration Overview */}
        <section className="p-6 md:p-8 rounded-3xl border border-border/60 bg-card shadow-md">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl tracking-tight font-bold font-heading">Collaborations</h2>
            <Link href="/collab" className="text-xs text-primary font-bold hover:underline bg-primary/10 px-2 py-1 rounded-md">View All</Link>
          </div>
          <div className="space-y-3">
            {collabsLoading ? (
              <div className="text-center text-sm text-muted-foreground py-4">Loading collaborations...</div>
            ) : collabs.length === 0 ? (
              <EmptyState
                icon={<Users className="w-8 h-8" />}
                title="No collaborations"
                description="Create collaborative cards and invite others to write messages!"
                actionText="View Collabs"
                onAction={() => window.location.href = "/collab"}
              />
            ) : (
              collabs.slice(0, 2).map((collab) => {
                const title = collab.config?.title || "Group Card";
                const recipient = collab.config?.recipient || "Recipient";
                return (
                  <div key={collab.id} className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10" />
                    <h4 className="text-sm font-bold relative z-10">{title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 mb-4 relative z-10 font-medium">For {recipient}</p>
                    <div className="flex items-center justify-between relative z-10">
                      <Link href={`/editor/${collab.theme_id}?id=${collab.id}`}>
                        <Button variant="secondary" size="sm" className="h-8 text-xs font-bold">Manage</Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
