"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Theme, SavedCard, Contribution } from "@/lib/themes/types";
import { ThemeStage } from "@/components/themes/renders/ThemeStage";
import { audioManager } from "@/lib/audio/manager";
import { triggerVibrate } from "@/lib/utils/device";
import { getTimeRemaining, isCountdownComplete } from "@/lib/utils/countdown";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { useToast } from "@/components/ui/ToastQueue";
import { Sparkles } from "lucide-react";

import { DeliveryRenderer } from "./DeliveryRenderer";
import { FloatingAudioControl } from "./FloatingAudioControl";
import { SurpriseGate } from "./SurpriseGate";
import { GroupCardLayout } from "./GroupCardLayout";
import { useRealtimeContributions } from "@/lib/hooks/useRealtimeContributions";
import { APP_CONFIG } from "@/lib/config/app-config";

interface ViewerLayoutProps {
  card: SavedCard;
  theme: Theme;
  initialContributions: Contribution[];
}

export function ViewerLayout({ card: initialCard, theme, initialContributions }: ViewerLayoutProps) {
  const toast = useToast();
  // For passcode-protected cards the server sends a stub with no real content, the actual
  // config only arrives from /verify-password once the passcode checks out. Holding the card
  // in state lets us swap the stub for the unlocked card without a reload.
  const [card, setCard] = useState<SavedCard>(initialCard);
  // Passcode-protected cards don't poll or subscribe: the contributions endpoint refuses them
  // and RLS excludes them from realtime, by design. Their list is seeded once from the
  // /verify-password response instead, so it is correct but not live.
  const isProtected = !!initialCard.password_hash;
  const { contributions, setContributions } = useRealtimeContributions(
    card.id,
    initialContributions,
    !isProtected
  );
  // Phase States: password-gate -> countdown -> delivery -> card-reveal
  const [phase, setPhase] = useState<"password-gate" | "countdown" | "surprise" | "delivery" | "card-reveal">(() => {
    if (card.password_hash) {
      return "password-gate";
    }
    if (card.scheduled_at && !isCountdownComplete(card.scheduled_at)) {
      return "countdown";
    }
    return card.config.surpriseMode ? "surprise" : "delivery";
  });

  const surpriseMode = card.config.surpriseMode;

  // Skip the delivery animation for a card this browser has already opened. localStorage is
  // only readable after mount, so this can't be part of the initial phase state.
  useEffect(() => {
    if (card.password_hash) return;
    if (card.scheduled_at && !isCountdownComplete(card.scheduled_at)) return;

    try {
      if (localStorage.getItem(`seen-${card.id}`) === "true") {
        setPhase("card-reveal");
      }
    } catch {
      /* storage unavailable (private mode), just play the delivery again */
    }
  }, [card.id, card.password_hash, card.scheduled_at]);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordAttempts, setPasswordAttempts] = useState(0);
  const [lockedOut, setLockedOut] = useState(false);

  // Lockout timer ref
  const lockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown State
  const [timeRemaining, setTimeRemaining] = useState(() =>
    card.scheduled_at ? getTimeRemaining(card.scheduled_at) : null
  );
  
  // RSVP Form States
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpResponse, setRsvpResponse] = useState<"yes" | "no" | "maybe">("yes");
  const [rsvpGuests, setRsvpGuests] = useState(1);
  const [rsvpNote, setRsvpNote] = useState("");
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);

  // Reactions States
  const [reactions, setReactions] = useState<{ emoji: string; count: number }[]>([]);
  const [userReacted, setUserReacted] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyDisplayName, setReplyDisplayName] = useState("");
  const [replyOpen, setReplyOpen] = useState(false);
  const [submittingReaction, setSubmittingReaction] = useState(false);

  // Floating Audio controller state
  const [audioMuted, setAudioMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioVolume, setAudioVolume] = useState(card.config.audioVolume ?? 0.5);

  const cardRef = useRef<HTMLDivElement>(null);
  const [interactionCompleted, setInteractionCompleted] = useState(false);

  // Clean up lock timer on unmount
  useEffect(() => {
    return () => {
      if (lockTimerRef.current) {
        clearTimeout(lockTimerRef.current);
      }
    };
  }, []);

  // Check countdown status. Takes the card explicitly so the unlock flow can pass the freshly
  // fetched card, `card` state hasn't committed yet at that point.
  const checkCountdownPhase = useCallback(
    (activeCard: SavedCard = card) => {
      if (activeCard.scheduled_at && !isCountdownComplete(activeCard.scheduled_at)) {
        setPhase("countdown");
      } else {
        const isSeen = typeof window !== "undefined" && localStorage.getItem(`seen-${activeCard.id}`) === "true";
        if (isSeen) {
          setPhase("card-reveal");
        } else {
          setPhase(activeCard.config.surpriseMode ? "surprise" : "delivery");
        }
      }
    },
    [card]
  );

  // Timer polling for countdown page
  useEffect(() => {
    if (phase !== "countdown" || !card.scheduled_at) return;

    const interval = setInterval(() => {
      const remaining = getTimeRemaining(card.scheduled_at!);
      setTimeRemaining(remaining);
      if (remaining.total <= 0) {
        clearInterval(interval);
        const isSeen = typeof window !== "undefined" && localStorage.getItem(`seen-${card.id}`) === "true";
        if (isSeen) {
          setPhase("card-reveal");
        } else {
          setPhase(surpriseMode ? "surprise" : "delivery");
        }
      }
    }, 1000);

    return () => clearInterval(interval);
    // `surpriseMode` is read inside the interval callback, so it must be a dependency,
    // otherwise the closure keeps whichever value was current when the countdown started
    // (notably the locked stub's `undefined`, which forced "delivery" after an unlock).
  }, [phase, card.id, card.scheduled_at, surpriseMode]);

  // Load Reactions Summary
  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const res = await fetch(`/api/cards/${card.id}/reactions`);
        if (res.ok) {
          const data = await res.json();
          setReactions(data.summary || []);
        }
      } catch (err) {
        console.error("Failed to load reactions", err);
      }
    };
    if (phase === "card-reveal") {
      fetchReactions();
    }
  }, [phase, card.id]);

  // Password Unlock Form handler
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerVibrate(30);

    if (lockedOut) return;

    try {
      const res = await fetch(`/api/cards/${card.id}/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput, type: "view" }),
      });
      const data = await res.json();

      if (res.status === 429) {
        // Server-side throttle hit, mirror it in the UI rather than showing "wrong passcode".
        setPasswordError(false);
        setLockedOut(true);
        if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
        lockTimerRef.current = setTimeout(() => {
          setLockedOut(false);
          setPasswordAttempts(0);
        }, APP_CONFIG.security.passwordLockoutMs);
        return;
      }

      if (res.ok && data.success && data.card) {
        setPasswordError(false);
        // The unlocked card (with its real config) only exists after a correct passcode.
        const unlockedCard = data.card as SavedCard;
        setCard(unlockedCard);
        setAudioVolume(unlockedCard.config.audioVolume ?? 0.5);
        if (Array.isArray(data.contributions)) {
          setContributions(data.contributions as Contribution[]);
        }
        checkCountdownPhase(unlockedCard);
      } else {
        setPasswordError(true);
        const nextAttempts = passwordAttempts + 1;
        setPasswordAttempts(nextAttempts);
        if (nextAttempts >= APP_CONFIG.security.passwordMaxAttempts) {
          setLockedOut(true);
          if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
          lockTimerRef.current = setTimeout(() => {
            setLockedOut(false);
            setPasswordAttempts(0);
          }, APP_CONFIG.security.passwordLockoutMs);
        }
      }
    } catch (err) {
      console.error("Passcode verification error", err);
      setPasswordError(true);
    }
  };

  // RSVP Form submission handler
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerVibrate(50);
    if (!rsvpName.trim()) return;

    setRsvpSubmitting(true);
    setRsvpError(null);
    try {
      const res = await fetch(`/api/cards/${card.id}/rsvps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: rsvpName,
          response: rsvpResponse,
          guest_count: rsvpGuests,
          note: rsvpNote,
        }),
      });

      if (res.ok) {
        setRsvpSubmitted(true);
      } else {
        const errData = await res.json().catch(() => ({}));
        setRsvpError(errData.error || "Failed to submit RSVP. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setRsvpError("A network error occurred. Please check your connection and try again.");
    } finally {
      setRsvpSubmitting(false);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    if (userReacted) return;
    triggerVibrate(25);
    setSelectedEmoji(emoji);
    setReplyOpen(true);
  };

  const handleReactSubmit = async (emoji: string, message?: string, displayName?: string) => {
    if (userReacted) return;
    triggerVibrate(40);
    setUserReacted(true);
    setReplyOpen(false);

    // optimistic update
    setReactions((prev) => {
      const existing = prev.find((r) => r.emoji === emoji);
      if (existing) {
        return prev.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1 } : r));
      } else {
        return [...prev, { emoji, count: 1 }];
      }
    });

    try {
      await fetch(`/api/cards/${card.id}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji, message, displayName }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Handle mute toggles
  const handleToggleMute = () => {
    triggerVibrate(20);
    const newMuted = !audioMuted;
    setAudioMuted(newMuted);
    if (newMuted) {
      audioManager.muteAll();
    } else {
      audioManager.unmuteAll();
    }
    setIsPlaying(audioManager.isBgPlaying());
  };

  const handleTogglePlay = () => {
    triggerVibrate(20);
    if (audioManager.isBgPlaying()) {
      audioManager.pauseBgMusic();
      setIsPlaying(false);
    } else {
      audioManager.playBgMusic();
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setAudioVolume(vol);
    audioManager.setBgVolume(vol);
  };

  const handleDownload = async () => {
    if (cardRef.current) {
      try {
        const { downloadCardAsImage } = await import("../../lib/utils/download-card");
        await downloadCardAsImage(cardRef.current, `card-${card.id}.png`);
        toast.success("Card image downloaded successfully! 📥");
      } catch (err) {
        toast.error("Failed to generate and download card image.");
      }
    }
  };

  // Render correct delivery animation wrapper
  const renderDelivery = () => {
    const style = card.delivery_style;
    const commonProps = {
      onComplete: () => {
        if (typeof window !== "undefined") {
          localStorage.setItem(`seen-${card.id}`, "true");
        }
        setPhase("card-reveal");
        // Increment view count after delivery
        fetch(`/api/cards/${card.id}`, { method: "PATCH" });
      },
      palette: card.config.palette,
    };

    return <DeliveryRenderer style={style} palette={commonProps.palette} onComplete={commonProps.onComplete} />;
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20" />

      {/* ==================== 1. PASSWORD GATE ==================== */}
      {phase === "password-gate" && (
        <div className="flex-1 flex items-center justify-center p-4 z-10 relative">
          <form
            onSubmit={handleUnlock}
            className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl text-center space-y-6"
          >
            <span className="text-4xl block animate-pulse">🔒</span>
            <div className="space-y-1">
              <h2 className="text-lg font-black font-heading">Private Greeting Card</h2>
              <p className="text-xs text-muted-foreground">This card is passcode protected.</p>
            </div>

            <div className="space-y-3 text-left">
              <Input
                type="password"
                label="Enter Passcode"
                placeholder="••••"
                disabled={lockedOut}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="text-center tracking-widest text-lg font-black"
                error={
                  passwordError && !lockedOut
                    ? `Incorrect passcode. ${Math.max(
                        0,
                        APP_CONFIG.security.passwordMaxAttempts - passwordAttempts
                      )} attempts remaining.`
                    : undefined
                }
              />
              
              <AnimatePresence>
                {lockedOut && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex gap-2.5 p-3.5 bg-destructive/10 border border-destructive/25 text-destructive rounded-2xl text-xs font-semibold leading-relaxed"
                  >
                    <span className="text-base leading-none">⚠️</span>
                    <div>
                      <h4 className="font-bold">Security Lockout Active</h4>
                      <p className="text-[10px] text-destructive/80 mt-0.5">Too many incorrect attempts. Please wait 5 minutes.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button
              type="submit"
              disabled={lockedOut || !passwordInput}
              fullWidth={true}
              className="font-bold"
            >
              Unlock Card ➔
            </Button>
          </form>
        </div>
      )}

      {/* ==================== 2. COUNTDOWN TIMER ==================== */}
      {phase === "countdown" && timeRemaining && (
        <div className="flex-1 flex items-center justify-center p-4 z-10 relative">
          <div className="text-center space-y-6 max-w-md bg-card/60 border border-border p-8 rounded-3xl backdrop-blur-md shadow-xl">
            <span className="text-4xl block animate-bounce">⏳</span>
            <div className="space-y-1">
              <h2 className="text-lg font-black font-heading">Card is Locked</h2>
              <p className="text-xs text-muted-foreground">Scheduled for future release.</p>
            </div>

            {/* Flip digit style card grid */}
            <div className="grid grid-cols-4 gap-3 select-none">
              {[
                { label: "Days", val: timeRemaining.days },
                { label: "Hours", val: timeRemaining.hours },
                { label: "Mins", val: timeRemaining.minutes },
                { label: "Secs", val: timeRemaining.seconds },
              ].map((item) => (
                <div key={item.label} className="bg-card border border-border/60 p-3.5 rounded-2xl flex flex-col items-center shadow-md relative min-w-[70px]">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-2xl" />
                  <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-border/20" />
                  <span className="text-2xl font-mono font-black text-primary drop-shadow-sm select-none z-10">
                    {String(item.val).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mt-1.5 select-none z-10">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            
            <p className="text-[10px] text-muted-foreground font-mono">
              Unlocks automatically upon reaching zero.
            </p>
          </div>
        </div>
      )}

      {/* ==================== SURPRISE GATE ==================== */}
      {phase === "surprise" && (
        <div className="flex-1 w-full h-full relative z-10">
          <SurpriseGate
            sender={card.config.sender}
            palette={card.config.palette}
            onOpen={() => setPhase("delivery")}
          />
        </div>
      )}

      {/* ==================== 3. DELIVERY ANIMATION ==================== */}
      {phase === "delivery" && (
        <div className="flex-1 w-full h-full relative z-10">
          {renderDelivery()}
        </div>
      )}

      {/* ==================== 4. CARD DISPLAY REVEAL ==================== */}
      {phase === "card-reveal" && (
        <div className="flex-1 flex flex-col items-center py-10 px-4 gap-8 z-10 pointer-events-auto">
          {/* Escape Hatch */}
          <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50">
            <Link href="/" title="Create your own card" className="flex items-center justify-center w-10 h-10 rounded-full bg-background/50 backdrop-blur-md border border-border text-muted-foreground hover:text-primary hover:bg-card transition-all duration-200 active:scale-95 shadow-sm focus-ring">
              <Sparkles className="w-4 h-4" />
            </Link>
          </div>

          {/* Main card box with smooth entrance scaling */}
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg aspect-[3/4] min-h-[500px] border border-border/50 rounded-3xl overflow-hidden shadow-2xl relative bg-black flex flex-col pointer-events-auto ring-1 ring-border/20"
          >
            <ThemeStage
              theme={theme}
              config={card.config}
              mode="full"
              contributions={contributions}
              onInteractionComplete={() => setInteractionCompleted(true)}
            />
          </motion.div>

          {/* Group card: everyone's contributions, live.
              Skipped for experiences that render contributions themselves. */}
          {card.is_collaborative &&
            !["live-canvas", "wish-jar", "reaction-wall"].includes(theme.experienceId ?? "") && (
              <GroupCardLayout contributions={contributions} />
            )}

          {/* Let viewers add to an open collaborative card */}
          {card.is_collaborative && (
            <Link
              href={`/collab/${card.id}`}
              onClick={() => triggerVibrate(15)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow hover:brightness-110 transition-all"
            >
              ✏️ Add your message
            </Link>
          )}

          {/* Interaction Reactions Section & RSVP */}
          {(!theme.interactive || interactionCompleted) && (
            <>
              {/* Interaction Reactions Section */}
              <div className="w-full max-w-lg bg-card border border-border p-6 rounded-3xl space-y-5 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                    Leave a Reaction
                  </span>
                  <Button
                    onClick={handleDownload}
                    size="sm"
                    className="font-bold flex items-center gap-1.5 shadow"
                  >
                    Download Card 📥
                  </Button>
                </div>

                <div className="flex justify-between gap-2.5">
                  {["❤️", "🥹", "😂", "🎉", "👏", "😍"].map((emoji) => {
                    const countMeta = reactions.find((r) => r.emoji === emoji);
                    const isSelected = selectedEmoji === emoji;
                    return (
                      <motion.button
                        key={emoji}
                        disabled={userReacted}
                        onClick={() => handleEmojiClick(emoji)}
                        whileHover={{ scale: userReacted ? 1 : 1.08 }}
                        whileTap={{ scale: userReacted ? 1 : 0.92 }}
                        aria-label={`React with ${emoji}`}
                        className={clsx(
                          "flex-1 py-3 rounded-2xl flex flex-col items-center gap-1 cursor-pointer transition-all border relative overflow-hidden focus-ring",
                          isSelected
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-card/40 border-border text-foreground hover:border-muted-foreground/30"
                        )}
                      >
                        <span className={clsx("text-2xl transition-transform duration-200", isSelected && "scale-125")}>
                          {emoji}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground font-semibold">{countMeta?.count || 0}</span>
                      </motion.button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {replyOpen && selectedEmoji && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 space-y-4 border-t border-border/40 mt-2">
                        <span className="text-xs font-bold text-primary block">
                          Reply with {selectedEmoji}
                        </span>
                        <div className="space-y-3">
                          <Input
                            label="Your Name"
                            placeholder="Anonymous"
                            value={replyDisplayName}
                            onChange={(e) => setReplyDisplayName(e.target.value)}
                          />
                          <TextArea
                            label="Short Message"
                            maxLength={200}
                            showCharCounter={true}
                            placeholder="Add a short comment (optional)"
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            rows={2}
                          />
                        </div>
                        <div className="flex justify-end gap-2.5 text-xs pt-1">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setReplyOpen(false);
                              setSelectedEmoji(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            disabled={submittingReaction}
                            onClick={async () => {
                              setSubmittingReaction(true);
                              await handleReactSubmit(selectedEmoji, replyMessage, replyDisplayName);
                              setSubmittingReaction(false);
                            }}
                          >
                            {submittingReaction ? "Sending..." : "Send Reaction"}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {userReacted && (
                  <div className="text-center text-xs font-semibold text-emerald-500 animate-pulse">
                    ✓ Reaction sent successfully!
                  </div>
                )}
              </div>

              {/* RSVP RESPONSE PANEL if hasRsvp is true */}
              {card.has_rsvp && !rsvpSubmitted && (
                <div className="w-full max-w-lg bg-card border border-border p-6 rounded-3xl space-y-5 shadow-sm">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                    🎫 RSVP Attendance
                  </span>

                  <form onSubmit={handleRsvpSubmit} className="space-y-5">
                    <Input
                      label="Your Name"
                      required
                      value={rsvpName}
                      onChange={(e) => setRsvpName(e.target.value)}
                      placeholder="e.g. Guest Name"
                    />

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-muted-foreground">Are you attending?</label>
                      <div className="grid grid-cols-3 gap-3">
                        {([
                          { val: "yes", label: "Going 👍" },
                          { val: "no", label: "Decline 👎" },
                          { val: "maybe", label: "Maybe 🤷" },
                        ] as const).map((item) => {
                          const active = rsvpResponse === item.val;
                          return (
                            <button
                              key={item.val}
                              type="button"
                              onClick={() => {
                                triggerVibrate(15);
                                setRsvpResponse(item.val);
                              }}
                              className={clsx(
                                "py-3 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 border cursor-pointer focus-ring select-none text-center",
                                active
                                  ? "bg-primary/10 border-primary text-primary"
                                  : "bg-card/45 border-border text-muted-foreground hover:border-muted-foreground/30"
                              )}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1.5 w-full select-none">
                      <label className="text-sm font-semibold text-muted-foreground">Guest Count</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={rsvpGuests <= 1}
                          onClick={() => {
                            triggerVibrate(20);
                            setRsvpGuests((prev) => Math.max(1, prev - 1));
                          }}
                          aria-label="Decrease guests"
                          className="w-11 h-11 border border-border rounded-xl bg-card hover:bg-secondary/40 text-lg font-bold flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none focus-ring"
                        >
                          −
                        </button>
                        <div className="w-16 h-11 border border-border rounded-xl bg-card/60 flex items-center justify-center font-mono font-bold text-sm">
                          {rsvpGuests}
                        </div>
                        <button
                          type="button"
                          disabled={rsvpGuests >= APP_CONFIG.features.maxRsvpGuests}
                          onClick={() => {
                            triggerVibrate(20);
                            setRsvpGuests((prev) => Math.min(APP_CONFIG.features.maxRsvpGuests, prev + 1));
                          }}
                          aria-label="Increase guests"
                          className="w-11 h-11 border border-border rounded-xl bg-card hover:bg-secondary/40 text-lg font-bold flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none focus-ring"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <TextArea
                      label="Short Note"
                      placeholder="Add a message for the hosts (optional)..."
                      value={rsvpNote}
                      onChange={(e) => setRsvpNote(e.target.value)}
                      rows={2}
                      maxLength={150}
                      showCharCounter={true}
                    />

                    {rsvpError && (
                      <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold flex items-start gap-2">
                        <span className="text-base leading-none">⚠️</span>
                        <span>{rsvpError}</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={rsvpSubmitting || !rsvpName.trim()}
                      fullWidth={true}
                      className="font-bold"
                    >
                      {rsvpSubmitting ? "Submitting..." : "Submit RSVP ✉️"}
                    </Button>
                  </form>
                </div>
              )}

              {card.has_rsvp && rsvpSubmitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-lg bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-3xl text-center space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto animate-bounce">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-500">RSVP Submitted</h4>
                    <p className="text-xs text-muted-foreground mt-1">Thank you! Your response has been recorded successfully.</p>
                  </div>
                </motion.div>
              )}
            </>
          )}

          {/* Virality footer link */}
          <div className="text-center pt-8 select-none">
            <Link
              href="/"
              onClick={() => triggerVibrate(15)}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-bold font-mono group"
            >
              <span>✨ Create your own interactive card,</span>
              <span className="underline decoration-primary/40 group-hover:decoration-primary transition-all underline-offset-4">
                CelebrationCraft
              </span>
            </Link>
          </div>
        </div>
      )}

      {(phase === "delivery" || phase === "card-reveal") && card.config.audioPreset !== "none" && (
        <FloatingAudioControl
          audioMuted={audioMuted}
          isPlaying={isPlaying}
          volume={audioVolume}
          onToggleMute={handleToggleMute}
          onTogglePlay={handleTogglePlay}
          onVolumeChange={handleVolumeChange}
        />
      )}
    </div>
  );
}

export default ViewerLayout;
