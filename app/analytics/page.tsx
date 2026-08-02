"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BarChart3, TrendingUp, Users, Eye } from "lucide-react";
import { useAnalyticsSummary, useMyCards } from "@/lib/hooks/useSupabaseData";
import { EmptyState } from "@/components/ui/EmptyState";
import { useUserId } from "@/lib/hooks/useUserId";

export default function AnalyticsPage() {
  const userId = useUserId();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  const { data: analytics, loading: analyticsLoading } = useAnalyticsSummary();
  const { data: cards, loading: cardsLoading } = useMyCards();

  useEffect(() => {
    if (!userId) {
      setProfileLoading(true);
      return;
    }
    const checkRole = async () => {
      try {
        const res = await fetch(`/api/auth/profile?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.is_admin);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setProfileLoading(false);
      }
    };
    checkRole();
  }, [userId]);

  const maxViews = cards && cards.length > 0
    ? Math.max(...cards.map((c) => c.view_count || 0), 1)
    : 1;

  const loading = analyticsLoading || cardsLoading || profileLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col md:pl-64">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8">
            <div className="h-9 w-64 bg-muted rounded-xl animate-pulse mb-2" />
            <div className="h-4 w-80 bg-muted/60 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-6 bg-card border border-border/60 rounded-2xl animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-10 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col md:pl-64">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-center">
          <EmptyState
            icon={<BarChart3 className="w-12 h-12 text-destructive" />}
            title="Restricted Access"
            description="The analytics dashboard is only accessible to system administrators. Please sign in with an admin account."
            actionText="Go Home"
            onAction={() => window.location.href = "/"}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:pl-64">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold font-heading text-foreground tracking-tight">Analytics & Insights</h1>
          <p className="text-muted-foreground mt-1 font-medium">Track the performance of your celebration cards.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-6 bg-card border border-border/60 rounded-2xl animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-10 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : cards.length === 0 ? (
          <EmptyState
            icon={<BarChart3 className="w-8 h-8" />}
            title="No analytics data"
            description="Create and share celebration cards to track views, reactions, and engagement."
            actionText="Browse Themes"
            onAction={() => window.location.href = "/explore"}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: "Total Projects", value: analytics.totalCards, icon: <BarChart3 className="w-6 h-6 text-blue-500" /> },
                { label: "Total Views", value: analytics.totalViews, icon: <Eye className="w-6 h-6 text-emerald-500" /> },
                { label: "Reactions", value: analytics.totalReactions, icon: <Users className="w-6 h-6 text-purple-500" /> },
                { label: "Shares", value: analytics.totalShares, icon: <TrendingUp className="w-6 h-6 text-amber-500" /> },
              ].map((stat, i) => (
                <div key={i} className="p-6 bg-card border border-border/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-muted-foreground">{stat.label}</span>
                    {stat.icon}
                  </div>
                  <h2 className="text-4xl font-extrabold font-heading">{stat.value}</h2>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold font-heading mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" /> Top Performing Cards
              </h3>
              
              <div className="space-y-6">
                {cards
                  .slice(0, 5)
                  .map((card) => {
                    const title = card.config?.title || "Celebration Card";
                    const views = card.view_count || 0;
                    const percentage = (views / maxViews) * 100;
                    const recipient = card.config?.recipient || "Recipient";
                    
                    return (
                      <div key={card.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm font-semibold">
                          <div className="flex flex-col">
                            <span className="truncate max-w-[200px] sm:max-w-md font-bold text-foreground">
                              {title}
                            </span>
                            <span className="text-xs text-muted-foreground">For {recipient}</span>
                          </div>
                          <span className="text-muted-foreground font-bold">{views} views</span>
                        </div>
                        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
