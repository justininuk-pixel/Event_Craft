"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  Settings,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Clock,
  Hash,
  Type,
  Zap,
} from "lucide-react";
import { useAISettings } from "@/lib/store/ai-settings";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HistoryEntry {
  id: number;
  text: string;
  category: string;
  tone: string;
  length: string;
  provider: string;
  model: string;
  timestamp: Date;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "Birthday", emoji: "🎂", label: "Birthday" },
  { value: "Wedding/Anniversary", emoji: "💍", label: "Wedding / Anniversary" },
  { value: "Thank You", emoji: "🙏", label: "Thank You" },
  { value: "Congratulations", emoji: "🎉", label: "Congratulations" },
  { value: "Apology", emoji: "💙", label: "Apology" },
  { value: "Get Well", emoji: "🌸", label: "Get Well Soon" },
  { value: "Sympathy", emoji: "🕊️", label: "Sympathy" },
  { value: "Invitation", emoji: "✉️", label: "Invitation" },
  { value: "Retirement", emoji: "🌅", label: "Retirement" },
  { value: "Graduation", emoji: "🎓", label: "Graduation" },
  { value: "Promotion", emoji: "🚀", label: "Promotion" },
  { value: "Breakup/Comfort", emoji: "🤗", label: "Breakup / Comfort" },
];

const TONES = [
  { value: "Heartfelt", label: "Heartfelt & Warm" },
  { value: "Funny", label: "Funny & Witty" },
  { value: "Formal", label: "Formal & Professional" },
  { value: "Poetic", label: "Poetic & Artistic" },
  { value: "Playful", label: "Playful & Quirky" },
  { value: "Romantic", label: "Romantic" },
  { value: "Inspirational", label: "Inspirational & Motivating" },
];

const LENGTHS = [
  { value: "short", label: "Short", sublabel: "1–2 sentences" },
  { value: "medium", label: "Medium", sublabel: "Paragraph" },
  { value: "long", label: "Long", sublabel: "Extended" },
];

// ─── Provider colours / badges ────────────────────────────────────────────────

const PROVIDER_COLORS: Record<string, string> = {
  gemini: "bg-blue-500",
  openai: "bg-emerald-500",
  anthropic: "bg-orange-500",
  deepseek: "bg-cyan-500",
  mistral: "bg-indigo-500",
  groq: "bg-yellow-500",
  cohere: "bg-teal-500",
  perplexity: "bg-purple-500",
  openrouter: "bg-pink-500",
  ollama: "bg-gray-500",
  lmstudio: "bg-slate-500",
};

// ─── Provider SVG icon concepts ────────────────────────────────────────────────

function ProviderIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    gemini: (
      <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
        <polygon points="16,4 28,28 4,28" fill="hsl(217,91%,60%)" opacity="0.85" />
        <polygon points="16,12 24,28 8,28" fill="hsl(217,91%,80%)" opacity="0.7" />
      </svg>
    ),
    openai: (
      <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
        <circle cx="16" cy="16" r="12" fill="hsl(152,60%,40%)" opacity="0.9" />
        <path d="M10 16 Q16 8 22 16 Q16 24 10 16Z" fill="white" opacity="0.85" />
      </svg>
    ),
    anthropic: (
      <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="6" fill="hsl(25,95%,55%)" opacity="0.9" />
        <text x="16" y="22" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">A</text>
      </svg>
    ),
    deepseek: (
      <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
        <circle cx="16" cy="16" r="12" fill="hsl(186,90%,40%)" opacity="0.9" />
        <path d="M10 20 L16 10 L22 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
    mistral: (
      <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="4" fill="hsl(243,65%,55%)" opacity="0.9" />
        <path d="M9 22 L16 10 L23 22" stroke="hsl(45,100%,70%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
    groq: (
      <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="8" fill="hsl(45,95%,52%)" opacity="0.9" />
        <text x="16" y="22" textAnchor="middle" fontSize="11" fontWeight="bold" fill="hsl(30,50%,20%)">GRQ</text>
      </svg>
    ),
    ollama: (
      <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
        <circle cx="16" cy="16" r="12" fill="hsl(220,15%,45%)" opacity="0.9" />
        <circle cx="12" cy="16" r="2.5" fill="white" />
        <circle cx="20" cy="16" r="2.5" fill="white" />
      </svg>
    ),
    lmstudio: (
      <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="6" fill="hsl(215,25%,38%)" opacity="0.9" />
        <path d="M10 22 L10 10 L22 16 Z" fill="hsl(180,70%,65%)" />
      </svg>
    ),
  };
  return (
    <div className="flex items-center justify-center">
      {icons[name] ?? (
        <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
          <circle cx="16" cy="16" r="12" fill="hsl(265,85%,57%)" opacity="0.9" />
          <path d="M12 16 L16 10 L20 16 L16 22Z" fill="white" opacity="0.85" />
        </svg>
      )}
    </div>
  );
}

// ─── Not-configured state ──────────────────────────────────────────────────────

function NotConfiguredCard() {
  const providerNames = [
    { id: "gemini", name: "Google Gemini", note: "Free tier available" },
    { id: "openai", name: "OpenAI GPT", note: "" },
    { id: "anthropic", name: "Anthropic Claude", note: "" },
    { id: "deepseek", name: "DeepSeek", note: "" },
    { id: "ollama", name: "Ollama (Local)", note: "Fully free & private" },
    { id: "lmstudio", name: "LM Studio", note: "Fully free & private" },
    { id: "mistral", name: "Mistral AI", note: "" },
    { id: "groq", name: "Groq", note: "" },
  ];

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-6">
      <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">AI Not Configured</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm leading-relaxed">
          Connect your preferred AI provider to start generating beautiful, personalised celebration messages.
          We support Bring Your Own Key (BYOK) for total privacy and control.
        </p>

        {/* Provider grid */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {providerNames.map((p) => (
            <div
              key={p.id}
              className="flex flex-col items-center gap-2 p-3 bg-secondary/30 rounded-xl border border-border/40 hover:border-primary/30 transition-colors"
            >
              <ProviderIcon name={p.id} />
              <span className="text-[10px] font-semibold text-foreground/80 text-center leading-tight">{p.name}</span>
              {p.note && (
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">{p.note}</span>
              )}
            </div>
          ))}
        </div>

        {/* Free tier callout */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 text-left">
          <h3 className="font-bold flex items-center gap-2 mb-1 text-emerald-700 dark:text-emerald-400 text-sm">
            <Zap className="w-4 h-4" /> Don&apos;t want to pay?
          </h3>
          <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 leading-relaxed">
            Set up <strong>Google Gemini AI Studio</strong> for a generous free daily quota, or run{" "}
            <strong>Ollama / LM Studio</strong> locally with small 2B–4B models, completely free and fully private.
          </p>
        </div>

        <Link href="/settings">
          <Button size="lg" variant="primary" iconRight={<ArrowRight className="w-4 h-4" />}>
            Configure AI Settings
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AIStudioPage() {
  const [mounted, setMounted] = useState(false);
  const store = useAISettings();

  // Form state
  const [category, setCategory] = useState("Birthday");
  const [tone, setTone] = useState("Heartfelt");
  const [length, setLength] = useState("medium");
  const [context, setContext] = useState("");

  // Output state
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Tab state: "result" | "history"
  const [activeTab, setActiveTab] = useState<"result" | "history">("result");

  // History
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyCounter, setHistoryCounter] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!store.isConfigured()) return;

    setGenerating(true);
    setResult(null);
    setError(null);
    setActiveTab("result");

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: store.provider,
          apiKey: store.apiKey,
          model: store.model,
          baseUrl: store.baseUrl,
          userName: store.userName,
          category,
          tone,
          context: [context, length === "short" ? "Keep it very brief: 1-2 sentences." : length === "long" ? "Write an extended, detailed version." : ""].filter(Boolean).join(" "),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP Error ${response.status}`);
      }

      const data = await response.json();
      const text: string = data.text;
      setResult(text);

      // Push to history (max 5)
      const entry: HistoryEntry = {
        id: historyCounter + 1,
        text,
        category,
        tone,
        length,
        provider: store.provider,
        model: store.model,
        timestamp: new Date(),
      };
      setHistoryCounter((c) => c + 1);
      setHistory((prev) => [entry, ...prev].slice(0, 5));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to generate text. Please check your API key and try again.";
      setError(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = (text: string) =>
    text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  const providerDot = PROVIDER_COLORS[store.provider] ?? "bg-primary";

  if (!mounted) return null;

  const isConfigured = store.isConfigured();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:pl-64">
      <Navbar />
      <main className="flex-1 p-6 lg:p-8 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Page header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold font-heading text-foreground tracking-tight flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-primary" /> AI Studio
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Generate customised messages and wording suggestions for your celebration cards.
            </p>
          </div>
          <Link href="/settings">
            <Button variant="ghost" size="sm" icon={<Settings className="w-4 h-4" />}>
              Configure
            </Button>
          </Link>
        </div>

        {!isConfigured ? (
          <NotConfiguredCard />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6 items-start">

            {/* ── Left: Form ──────────────────────────────────────────── */}
            <form onSubmit={handleGenerate} className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-5 sticky top-6">
              <h3 className="font-bold text-base text-foreground">Generator Settings</h3>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-4 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground appearance-none cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.emoji} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full h-11 px-4 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground appearance-none cursor-pointer"
                >
                  {TONES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Length selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Length
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {LENGTHS.map((l) => (
                    <button
                      key={l.value}
                      type="button"
                      onClick={() => setLength(l.value)}
                      className={[
                        "flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all duration-150 cursor-pointer",
                        length === l.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                      ].join(" ")}
                    >
                      <span className="text-sm font-bold">{l.label}</span>
                      <span className={["font-normal mt-0.5", length === l.value ? "text-primary/70" : "text-muted-foreground/60"].join(" ")}>
                        {l.sublabel}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Context */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Additional Context <span className="normal-case font-normal">(optional)</span>
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g. for my sister who is starting medical school, she loves cats and coffee"
                  rows={3}
                  className="w-full p-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50 text-foreground resize-none"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                loading={generating}
                fullWidth
                icon={!generating ? <Sparkles className="w-4 h-4" /> : undefined}
              >
                Generate Copy
              </Button>
            </form>

            {/* ── Right: Output ────────────────────────────────────────── */}
            <div className="bg-card border border-border/50 rounded-2xl shadow-sm flex flex-col overflow-hidden">

              {/* Output header + tabs */}
              <div className="flex items-center justify-between px-6 pt-5 pb-0 border-b border-border/40">
                <div className="flex items-center gap-1">
                  {/* Result tab */}
                  <button
                    type="button"
                    onClick={() => setActiveTab("result")}
                    className={[
                      "relative px-4 py-2.5 text-sm font-semibold transition-colors duration-150 cursor-pointer",
                      activeTab === "result"
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    Result
                    {activeTab === "result" && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </button>

                  {/* History tab */}
                  <button
                    type="button"
                    onClick={() => setActiveTab("history")}
                    className={[
                      "relative px-4 py-2.5 text-sm font-semibold transition-colors duration-150 cursor-pointer flex items-center gap-1.5",
                      activeTab === "history"
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    History
                    {history.length > 0 && (
                      <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
                        {history.length}
                      </span>
                    )}
                    {activeTab === "history" && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </button>
                </div>

                {/* Provider badge */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2.5 py-1 bg-secondary/40 rounded-full font-medium mb-1">
                  <span className={["w-2 h-2 rounded-full shrink-0", providerDot].join(" ")} />
                  <span className="capitalize">{store.provider}</span>
                </div>
              </div>

              {/* Tab content */}
              <div className="p-6 flex-1">

                {/* ── Result tab ── */}
                {activeTab === "result" && (
                  <div className="flex flex-col gap-4">
                    {generating ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-primary" />
                        <p className="text-xs font-mono text-muted-foreground">
                          Crafting your words using {store.model}…
                        </p>
                      </div>
                    ) : result ? (
                      <>
                        <div className="bg-secondary/20 border border-border/40 rounded-xl p-5 min-h-[180px] max-h-[380px] overflow-y-auto">
                          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap font-medium">
                            {result}
                          </p>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {result.length} chars
                          </span>
                          <span className="flex items-center gap-1">
                            <Type className="w-3 h-3" />
                            {wordCount(result)} words
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                          <Button
                            onClick={() => handleCopy(result)}
                            variant="secondary"
                            size="sm"
                            icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            className="flex-1"
                          >
                            {copied ? "Copied!" : "Copy"}
                          </Button>
                          <Button
                            onClick={() => handleGenerate()}
                            variant="outline"
                            size="sm"
                            disabled={generating}
                            icon={<RefreshCw className="w-3.5 h-3.5" />}
                            className="flex-1"
                          >
                            Regenerate
                          </Button>
                          <Button
                            onClick={() => (window.location.href = "/explore")}
                            variant="primary"
                            size="sm"
                            iconRight={<ArrowRight className="w-3.5 h-3.5" />}
                            className="flex-1"
                          >
                            Use in Card
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border border-dashed border-border/40 rounded-xl bg-secondary/10 gap-3">
                        <Sparkles className="w-10 h-10 text-muted-foreground/30" />
                        <p className="text-xs font-medium text-center max-w-[200px] leading-relaxed">
                          Fill in the settings and click &ldquo;Generate Copy&rdquo; to craft your message.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── History tab ── */}
                {activeTab === "history" && (
                  <div className="space-y-3">
                    {history.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                        <Clock className="w-9 h-9 text-muted-foreground/30" />
                        <p className="text-xs font-medium">No history yet. Generate some copy to see it here.</p>
                      </div>
                    ) : (
                      history.map((entry) => (
                        <HistoryCard
                          key={entry.id}
                          entry={entry}
                          onCopy={() => handleCopy(entry.text)}
                          onUse={() => {
                            setResult(entry.text);
                            setActiveTab("result");
                          }}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

// ─── History card component ────────────────────────────────────────────────────

function HistoryCard({
  entry,
  onCopy,
  onUse,
}: {
  entry: HistoryEntry;
  onCopy: () => void;
  onUse: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const preview = entry.text.length > 120 ? entry.text.slice(0, 120) + "…" : entry.text;
  const timeLabel = entry.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="bg-secondary/20 border border-border/40 rounded-xl overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-secondary/30 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold text-foreground">{entry.category}</span>
            <span className="text-muted-foreground/50">·</span>
            <span className="text-xs text-muted-foreground">{entry.tone}</span>
            <span className="text-muted-foreground/50">·</span>
            <span className="text-xs text-muted-foreground capitalize">{entry.length}</span>
          </div>
          <p className="text-xs text-muted-foreground/80 truncate">{preview}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-muted-foreground">{timeLabel}</span>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap bg-background/60 rounded-lg p-3 border border-border/30">
            {entry.text}
          </p>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleCopy}
              variant="secondary"
              size="sm"
              icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button onClick={onUse} variant="outline" size="sm">
              Restore to Result
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
