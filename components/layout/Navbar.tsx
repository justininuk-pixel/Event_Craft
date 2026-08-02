"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useTheme } from "@/components/providers/ThemeProvider";
import { CommandPalette } from "./CommandPalette";
import { MobileBottomNav } from "./MobileBottomNav";
import { useUserId } from "@/lib/hooks/useUserId";
import { supabase } from "@/lib/db/client";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastQueue";
import { 
  Home, 
  Compass, 
  Wand2, 
  FolderOpen, 
  Users, 
  CalendarDays, 
  BarChart3, 
  Image as ImageIcon, 
  Bot,
  Sparkles,
  Settings
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const toast = useToast();
  const userId = useUserId();
  
  const [isOpenPalette, setIsOpenPalette] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [shortcutKey, setShortcutKey] = useState("⌘K");

  // Auth States
  const [profile, setProfile] = useState<{ is_admin: boolean; is_pro: boolean; email: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const isAdmin = profile?.is_admin || false;
  const isPro = profile?.is_pro || false;

  // Ctrl+K / Cmd+K listener
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isWin = navigator.userAgent.toLowerCase().includes("win");
      if (isWin) setShortcutKey("Ctrl+K");
    }

    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpenPalette((prev) => !prev);
      }
    };
    const handleOpenPalette = () => {
      setIsOpenPalette(true);
    };

    window.addEventListener("keydown", handleShortcut);
    window.addEventListener("open-command-palette", handleOpenPalette);
    
    return () => {
      window.removeEventListener("keydown", handleShortcut);
      window.removeEventListener("open-command-palette", handleOpenPalette);
    };
  }, []);

  const fetchProfile = async (uid: string) => {
    try {
      const res = await fetch(`/api/auth/profile?userId=${uid}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    } else {
      setProfile(null);
    }
  }, [userId]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAuthError("Email and Password are required");
      return;
    }
    setAuthLoading(true);
    setAuthError("");
    try {
      if (authMode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in successfully!");
        setShowAuthModal(false);
        setEmail("");
        setPassword("");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Account created successfully! Check your email or try signing in.");
        setShowAuthModal(false);
        setEmail("");
        setPassword("");
      }
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully!");
      setProfile(null);
    } catch (err: any) {
      toast.error("Sign out failed");
    }
  };

  const toggleAdmin = async () => {
    if (!userId || userId.startsWith("anon_")) return;
    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, is_admin: !profile?.is_admin }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        toast.success(`Admin status toggled to: ${updated.is_admin}`);
        // Reload to update dynamic route filters across page context
        window.location.reload();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to toggle admin role");
      }
    } catch (err) {
      toast.error("Failed to toggle admin role");
    }
  };

  const togglePro = async () => {
    if (!userId || userId.startsWith("anon_")) return;
    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, is_pro: !profile?.is_pro }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        toast.success(`Pro subscription toggled to: ${updated.is_pro}`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to toggle pro role");
      }
    } catch (err) {
      toast.error("Failed to toggle pro role");
    }
  };

  const navGroups = [
    {
      title: "Main",
      links: [
        { label: "Home", href: "/", icon: <Home className="w-5 h-5" /> },
        { label: "Explore", href: "/explore", icon: <Compass className="w-5 h-5" /> },
        { label: "Create", href: "/editor", icon: <Wand2 className="w-5 h-5" /> },
      ]
    },
    {
      title: "Workspace",
      links: [
        { label: "Projects", href: "/projects", icon: <FolderOpen className="w-5 h-5" /> },
        { label: "Collaborations", href: "/collab", icon: <Users className="w-5 h-5" /> },
        { label: "Schedule", href: "/schedule", icon: <CalendarDays className="w-5 h-5" /> },
        ...(isAdmin ? [{ label: "Analytics", href: "/analytics", icon: <BarChart3 className="w-5 h-5" /> }] : []),
      ]
    },
    {
      title: "Assets",
      links: [
        { label: "Media Library", href: "/media", icon: <ImageIcon className="w-5 h-5" /> },
        { label: "AI Studio", href: "/ai", icon: <Bot className="w-5 h-5" /> },
        { label: "Settings", href: "/settings", icon: <Settings className="w-5 h-5" /> },
      ]
    }
  ];

  // Reserve space for the fixed mobile bottom nav (only on pages that render the
  // Navbar, the editor and card viewer don't, so they stay full-bleed).
  useEffect(() => {
    document.body.classList.add("has-bottom-nav");
    return () => document.body.classList.remove("has-bottom-nav");
  }, []);

  return (
    <>
      {/* Mobile Top Navbar */}
      <header className="md:hidden sticky top-0 z-nav w-full glass-panel border-b border-border/70">
        <div className="flex items-center justify-between px-4 h-16">
          <Link href="/" className="flex items-center gap-2 focus-ring rounded-lg py-1 text-primary">
            <Sparkles className="w-6 h-6" />
            <span className="font-extrabold text-base tracking-wider font-heading text-foreground">
              CelebrationCraft
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpenPalette(true)}
              className="p-2 text-muted-foreground"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-muted-foreground"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="px-4 py-4 bg-card border-b border-border/70 flex flex-col gap-4 max-h-[80vh] overflow-y-auto shadow-xl">
            {/* User Account mobile */}
            <div className="rounded-xl bg-secondary/30 border border-border p-3 flex flex-col gap-2">
              {profile && !userId?.startsWith("anon_") ? (
                <div className="space-y-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Account</span>
                    <span className="text-xs font-bold truncate text-foreground">{profile.email}</span>
                  </div>
                  <div className="flex gap-1">
                    {profile.is_admin && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Admin</span>}
                    {profile.is_pro && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Pro</span>}
                  </div>
                  <button 
                    onClick={handleSignOut} 
                    className="w-full py-1 bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-semibold rounded-lg"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setAuthMode("signin");
                    setShowAuthModal(true);
                  }}
                  className="w-full py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg"
                >
                  Log In / Sign Up
                </button>
              )}
            </div>

            {navGroups.map((group) => (
              <div key={group.title}>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{group.title}</div>
                <div className="flex flex-col gap-1">
                  {group.links.map((link) => {
                    const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={clsx(
                          "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all",
                          isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                        )}
                      >
                        <span>{link.icon}</span>
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed inset-y-0 left-0 z-nav bg-card border-r border-border/50 shadow-sm overflow-y-auto">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2.5 focus-ring rounded-lg text-primary">
            <Sparkles className="w-7 h-7 shrink-0" />
            <span className="font-extrabold text-lg tracking-wider font-heading bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
              CelebrationCraft
            </span>
          </Link>
        </div>

        <div className="px-4 pb-6">
          <button
            onClick={() => setIsOpenPalette(true)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border/80 bg-background text-muted-foreground hover:text-foreground hover:border-border hover:shadow-sm transition-all focus-ring text-left"
          >
            <svg className="h-4.5 w-4.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-sm font-medium flex-1">Search...</span>
            <kbd className="h-5 items-center gap-0.5 rounded border border-border px-1.5 font-mono text-[9px] font-bold text-muted-foreground shadow-sm bg-secondary">
              {shortcutKey}
            </kbd>
          </button>
        </div>

        <div className="flex-1 px-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              <div className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {group.title}
              </div>
              <div className="flex flex-col gap-1">
                {group.links.map((link) => {
                  const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      className={clsx(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group",
                        isActive 
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary-glow" 
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <span className={clsx("transition-transform", isActive ? "" : "group-hover:scale-110")}>{link.icon}</span>
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 mt-auto border-t border-border/50 space-y-4">
          {/* User Account / Profile */}
          <div className="rounded-xl bg-secondary/20 border border-border p-3 flex flex-col gap-2">
            {profile && !userId?.startsWith("anon_") ? (
              <div className="space-y-2.5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Logged In As</span>
                  <span className="text-xs font-bold truncate text-foreground" title={profile.email}>{profile.email}</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {profile.is_admin && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Admin</span>}
                  {profile.is_pro && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Pro</span>}
                </div>
                
                {/* Mock Role Toggles for Testing */}
                <div className="pt-2 border-t border-border/40 space-y-1.5">
                  <button 
                    onClick={toggleAdmin} 
                    className="w-full text-left text-[10px] font-semibold text-blue-500 hover:underline flex items-center justify-between"
                  >
                    <span>Toggle Admin role</span>
                    <span>{profile.is_admin ? "Demote" : "Promote"}</span>
                  </button>
                  <button 
                    onClick={togglePro} 
                    className="w-full text-left text-[10px] font-semibold text-emerald-500 hover:underline flex items-center justify-between"
                  >
                    <span>Toggle Pro subscription</span>
                    <span>{profile.is_pro ? "Cancel" : "Activate"}</span>
                  </button>
                </div>

                <button 
                  onClick={handleSignOut} 
                  className="w-full py-1.5 bg-secondary/50 hover:bg-secondary border border-border text-foreground text-xs font-semibold rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Account (Optional)</span>
                  <span className="text-xs text-muted-foreground">Guest Mode</span>
                </div>
                <button 
                  onClick={() => {
                    setAuthMode("signin");
                    setShowAuthModal(true);
                  }}
                  className="w-full py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:brightness-110 shadow-md shadow-primary-glow transition-all"
                >
                  Log In / Sign Up
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-3">
            <span className="text-sm font-semibold text-muted-foreground">Theme</span>
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-1.5 rounded-lg border border-border/80 bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus-ring"
            >
              {resolvedTheme === "dark" ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Conditional Pro Promotion Box */}
          {!isPro && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 text-center relative overflow-hidden">
               <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--primary)_1px,transparent_1px)] bg-[size:1rem_1rem] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-10" />
               <h4 className="text-sm font-bold text-foreground relative z-10">Upgrade to Pro</h4>
               <p className="text-xs text-muted-foreground mt-1 mb-3 relative z-10">Higher limits & early features.</p>
               <button 
                 onClick={() => {
                   if (profile && !userId?.startsWith("anon_")) {
                     togglePro();
                   } else {
                     setAuthMode("signup");
                     setShowAuthModal(true);
                     toast.info("Please create an account first to upgrade to Pro!");
                   }
                 }} 
                 className="block w-full py-2 bg-foreground text-background text-xs font-bold rounded-lg hover:scale-[1.02] transition-transform relative z-10 shadow-lg cursor-pointer"
               >
                 Activate Pro (Mock)
               </button>
            </div>
          )}
        </div>
      </aside>

      <CommandPalette isOpen={isOpenPalette} onClose={() => setIsOpenPalette(false)} />

      <MobileBottomNav />

      {/* ==================== AUTHENTICATION MODAL ==================== */}
      <Modal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        title={authMode === "signin" ? "Welcome Back" : "Create Account"}
        description={authMode === "signin" ? "Log in to manage your private projects and roles." : "Sign up to unlock admin/pro status indicators."}
        size="sm"
      >
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <Input 
            type="email" 
            label="Email Address" 
            placeholder="name@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input 
            type="password" 
            label="Password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {authError && (
            <p className="text-xs text-destructive font-semibold bg-destructive/10 border border-destructive/20 p-2 rounded-lg">
              {authError}
            </p>
          )}

          <Button 
            type="submit" 
            fullWidth 
            loading={authLoading}
          >
            {authMode === "signin" ? "Log In" : "Sign Up"}
          </Button>

          <div className="text-center pt-2 border-t border-border/40">
            {authMode === "signin" ? (
              <p className="text-xs text-muted-foreground">
                Don&apos;t have an account?{" "}
                <button 
                  type="button" 
                  onClick={() => {
                    setAuthMode("signup");
                    setAuthError("");
                  }} 
                  className="font-bold text-primary hover:underline"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Already have an account?{" "}
                <button 
                  type="button" 
                  onClick={() => {
                    setAuthMode("signin");
                    setAuthError("");
                  }} 
                  className="font-bold text-primary hover:underline"
                >
                  Log In
                </button>
              </p>
            )}
          </div>
        </form>
      </Modal>
    </>
  );
}
