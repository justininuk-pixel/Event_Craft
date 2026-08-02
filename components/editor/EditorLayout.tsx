"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Theme } from "@/lib/themes/types";
import { ThemeStage } from "@/components/themes/renders/ThemeStage";
import { EditorSidebar } from "./EditorSidebar";
import { renderShape } from "./TransformableSticker";
import { ShareModal } from "./ShareModal";
import { RecipientSimulator } from "@/components/viewer/RecipientSimulator";
import { LayersPanel } from "./LayersPanel";
import { ElementTimeline } from "./ElementTimeline";
import { CropModal } from "./CropModal";
import { useEditorStore } from "@/lib/editor/store";
import { triggerVibrate } from "@/lib/utils/device";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastQueue";
import { Modal } from "@/components/ui/Modal";
import clsx from "clsx";
import { Sparkles, Palette, Diamond, Image as ImageIcon, Sticker, Music, Bot, Square, Circle, Star, Save, Play, Pause, Type, Pencil, Check, X, ZoomIn, ZoomOut, Maximize, PlayCircle, Layers, ArrowLeft, Clock3 } from "lucide-react";
import { useUserId } from "@/lib/hooks/useUserId";
import SignaturePad from "signature_pad";
import { useThemeSummaries } from "@/lib/themes/client";
import { useAISettings } from "@/lib/store/ai-settings";
import { useMyMedia } from "@/lib/hooks/useSupabaseData";
import { AUDIO_PRESETS } from "@/lib/themes/audio-presets";
import { audioManager } from "@/lib/audio/manager";
import { getDefaultConfig } from "@/lib/editor/defaults";

interface EditorLayoutProps {
  theme: Theme;
}

const STICKER_CATEGORIES = [
  {
    name: "Hearts",
    stickers: [
      { id: "heart-classic", label: "Classic" },
      { id: "heart-sparkle", label: "Sparkle" },
      { id: "heart-double", label: "Double" },
      { id: "heart-outline", label: "Outline" },
      { id: "heart-ribbon", label: "Ribbon" },
      { id: "heart-broken", label: "Broken" },
      { id: "heart-envelope", label: "Envelope" },
      { id: "heart-arrow", label: "Arrow" }
    ]
  },
  {
    name: "Celebration",
    stickers: [
      { id: "celebration-balloon", label: "Balloon" },
      { id: "celebration-fireworks", label: "Fireworks" },
      { id: "celebration-gift", label: "Gift" },
      { id: "celebration-hat", label: "Hat" },
      { id: "celebration-popper", label: "Popper" },
      { id: "celebration-disco", label: "Disco" },
      { id: "celebration-champagne", label: "Champagne" },
      { id: "celebration-trophy", label: "Trophy" }
    ]
  },
  {
    name: "Stars & Badges",
    stickers: [
      { id: "star-classic", label: "Star" },
      { id: "star-sparkle", label: "Sparkle" },
      { id: "star-burst", label: "Burst" },
      { id: "star-group", label: "Stars" },
      { id: "star-shooting", label: "Shooting" },
      { id: "star-outline", label: "Outline" },
      { id: "star-badge", label: "Badge" },
      { id: "star-crescent", label: "Crescent" }
    ]
  },
  {
    name: "Animals",
    stickers: [
      { id: "animal-bear", label: "Bear" },
      { id: "animal-cat", label: "Cat" },
      { id: "animal-dog", label: "Dog" },
      { id: "animal-fox", label: "Fox" },
      { id: "animal-lion", label: "Lion" },
      { id: "animal-panda", label: "Panda" },
      { id: "animal-rabbit", label: "Rabbit" },
      { id: "animal-paw", label: "Paw" }
    ]
  },
  {
    name: "Flowers",
    stickers: [
      { id: "flower-rose", label: "Rose" },
      { id: "flower-daisy", label: "Daisy" },
      { id: "flower-bouquet", label: "Bouquet" },
      { id: "flower-sunflower", label: "Sunflower" },
      { id: "flower-tulip", label: "Tulip" },
      { id: "flower-hibiscus", label: "Hibiscus" },
      { id: "flower-sakura", label: "Sakura" },
      { id: "flower-leaf", label: "Leaf" }
    ]
  },
  {
    name: "Food & Drinks",
    stickers: [
      { id: "food-cake", label: "Cake" },
      { id: "food-cupcake", label: "Cupcake" },
      { id: "food-cookie", label: "Cookie" },
      { id: "food-pizza", label: "Pizza" },
      { id: "food-burger", label: "Burger" },
      { id: "food-icecream", label: "Ice Cream" },
      { id: "food-cheers", label: "Cheers" },
      { id: "food-coffee", label: "Coffee" }
    ]
  },
  {
    name: "Emojis",
    stickers: [
      { id: "emoji-smile", label: "Smile" },
      { id: "emoji-love", label: "Love" },
      { id: "emoji-party", label: "Party" },
      { id: "emoji-laugh", label: "Laugh" },
      { id: "emoji-wink", label: "Wink" },
      { id: "emoji-sunglasses", label: "Cool" },
      { id: "emoji-mindblown", label: "Mindblown" },
      { id: "emoji-cry", label: "Cry" }
    ]
  },
  {
    name: "Weather",
    stickers: [
      { id: "weather-sun", label: "Sun" },
      { id: "weather-moon", label: "Moon" },
      { id: "weather-cloud", label: "Cloud" },
      { id: "weather-rainbow", label: "Rainbow" },
      { id: "weather-snowflake", label: "Snowflake" },
      { id: "weather-lightning", label: "Lightning" },
      { id: "weather-umbrella", label: "Umbrella" },
      { id: "weather-wind", label: "Wind" }
    ]
  },
  {
    name: "Ribbons & Banners",
    stickers: [
      { id: "ribbon-gift", label: "Gift Box" },
      { id: "ribbon-bow", label: "Bow" },
      { id: "ribbon-award", label: "Award" },
      { id: "ribbon-banner", label: "Banner" },
      { id: "ribbon-wreath", label: "Wreath" },
      { id: "ribbon-corner", label: "Corner" }
    ]
  },
  {
    name: "Religious & Spiritual",
    stickers: [
      { id: "religious-candle", label: "Candle" },
      { id: "religious-dove", label: "Dove" },
      { id: "religious-cross", label: "Cross" },
      { id: "religious-star-david", label: "Star of David" },
      { id: "religious-crescent", label: "Crescent" },
      { id: "religious-prayer-hands", label: "Prayer" },
      { id: "religious-lotus", label: "Lotus" },
      { id: "religious-om", label: "Om" }
    ]
  }
];

const EditorPreviewWrapper = React.memo(function EditorPreviewWrapper({ theme }: { theme: Theme }) {
  const config = useEditorStore((state) => state.config);
  return <ThemeStage theme={theme} config={config} mode="editor-preview" />;
});

const SimulatorWrapper = React.memo(function SimulatorWrapper({ theme, open, onClose }: { theme: Theme, open: boolean, onClose: () => void }) {
  const config = useEditorStore((state) => state.config);
  return <RecipientSimulator theme={theme} config={config} open={open} onClose={onClose} />;
});

export function EditorLayout({ theme }: EditorLayoutProps) {
  const userId = useUserId();
  const { summaries: themeSwatches } = useThemeSummaries();
  const { updateField, undo, redo, saveDraft, restoreDraft, historyIndex, history, setConfig } = useEditorStore();
  const audioPreset = useEditorStore(state => state.config.audioPreset);
  const toast = useToast();
  
  const [publishing, setPublishing] = useState(false);
  const [shareData, setShareData] = useState<{ cardUrl: string; collabUrl?: string; creatorSecret?: string; cardId?: string } | null>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState("edit");
  const [showSimulator, setShowSimulator] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [showDraftRestorePrompt, setShowDraftRestorePrompt] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState("elements");
  const [activeDropdown, setActiveDropdown] = useState<"file" | "edit" | "view" | null>(null);
  const [activeScene, setActiveScene] = useState<number>(0);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
  } | null>(null);

  const showConfirm = (title: string, description: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmDialog({
        isOpen: true,
        title,
        description,
        onConfirm: () => {
          setConfirmDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(null);
          resolve(false);
        }
      });
    });
  };

  // AI
  const aiSettings = useAISettings();
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTone, setAiTone] = useState("Heartfelt & Warm");
  const [aiMode, setAiMode] = useState<"personalize" | "text">("personalize");
  const [aiTargetField, setAiTargetField] = useState<"body" | "title">("body");
  const [generatingAI, setGeneratingAI] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [brushColor, setBrushColor] = useState("#2563eb");
  const [brushSize, setBrushSize] = useState(3);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { data: mediaFiles = [], loading: mediaLoading, refetch: refetchMedia } = useMyMedia();

  // Calculated values
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Effects
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPlaying(audioManager.isBgPlaying());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSeen = localStorage.getItem("editor-onboarding-seen");
      if (!hasSeen) {
        setShowHelpModal(true);
        localStorage.setItem("editor-onboarding-seen", "true");
      }
    }
  }, []);

  // Global Keyboard Shortcuts (Undo/Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  useEffect(() => {
    if (isDrawMode && drawingCanvasRef.current) {
      const canvas = drawingCanvasRef.current;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      const pad = new SignaturePad(canvas, {
        minWidth: brushSize / 2,
        maxWidth: brushSize * 1.5,
        penColor: brushColor,
      });
      signaturePadRef.current = pad;

      return () => {
        pad.off();
        signaturePadRef.current = null;
      };
    }
  }, [isDrawMode, brushColor, brushSize]);

  // Handlers
  const toggleDrawMode = async () => {
    if (isDrawMode) {
      if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
        const save = await showConfirm(
          "Unsaved Drawings",
          "Do you want to save your current drawing as a sticker before turning off the draw tool?"
        );
        if (save) {
          const dataUrl = signaturePadRef.current.toDataURL("image/png");
          if (dataUrl) {
            const newStickers = [...(useEditorStore.getState().config.stickers || [])];
            newStickers.push({ stickerId: dataUrl, x: 50, y: 50, rotation: 0, scale: 1 });
            updateField("stickers", newStickers);
            toast.success("Drawing saved!");
          }
        }
      }
      setIsDrawMode(false);
    } else {
      setIsDrawMode(true);
    }
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error(aiMode === "personalize" ? "Tell the AI who or what this card is for." : "Please describe what you want to generate.");
      return;
    }
    if (!aiSettings.isConfigured()) {
      toast.error("Configure AI in Settings first.");
      return;
    }
    setGeneratingAI(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: aiSettings.provider,
          apiKey: aiSettings.apiKey,
          model: aiSettings.model,
          baseUrl: aiSettings.baseUrl,
          userName: aiSettings.userName,
          category: theme.category || "celebration",
          tone: aiTone,
          context: aiPrompt,
          ...(aiMode === "personalize"
            ? {
                mode: "personalize",
                about: aiPrompt,
                theme: {
                  name: theme.name,
                  description: theme.description,
                  mechanic: theme.mechanic?.summary || theme.mechanic?.interaction,
                },
              }
            : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      if (aiMode === "personalize" && data.card) {
        // Apply every returned field into the card settings so the whole theme reflects it.
        if (data.card.title) updateField("title", data.card.title);
        if (data.card.subtitle) updateField("subtitle", data.card.subtitle);
        if (data.card.body) updateField("body", data.card.body);
        toast.success("Card personalised, title, subtitle and message updated!");
      } else {
        updateField(aiTargetField, data.text);
        toast.success(`Content applied to ${aiTargetField}!`);
      }
      setAiPrompt("");
    } catch (err: any) {
      toast.error(err.message || "AI generation failed. Check your API key in Settings.");
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Only image uploads are supported here.");
      return;
    }

    try {
      setUploadingMedia(true);
      const formData = new FormData();
      formData.append("file", file);
      if (userId) {
        formData.append("userId", userId);
      }

      const res = await fetch("/api/upload/photo", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Upload failed");
      }

      await refetchMedia();
      toast.success("Image uploaded successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload file");
    } finally {
      setUploadingMedia(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownloadPreview = async () => {
    if (!previewRef.current) return;
    try {
      const { toPng } = await import("html-to-image");
      
      const dataUrl = await toPng(previewRef.current, {
        quality: 0.95,
        backgroundColor: "#000",
        filter: (node: HTMLElement) => {
          if (node.classList) {
            return !node.classList.contains("z-50") && 
                   !node.classList.contains("cursor-pointer") && 
                   !node.tagName?.toLowerCase().includes("button");
          }
          return true;
        }
      });
      
      const link = document.createElement("a");
      link.download = `event-card-${theme.id}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Card exported successfully! 📸");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export card image.");
    }
  };

  const handlePublish = async () => {
    triggerVibrate(50);
    const config = useEditorStore.getState().config;
    if (!config.recipient?.trim()) {
      toast.error("Recipient name is required.");
      return;
    }
    if (!config.sender?.trim()) {
      toast.error("Sender name is required.");
      return;
    }
    setPublishing(true);
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themeId: theme.id,
          config,
          deliveryStyle: config.deliveryStyle,
          audioPreset: config.audioPreset,
          isCollaborative: config.isCollaborative,
          maxContributors: config.maxContributors,
          collabPassword: config.collabPassword,
          scheduledAt: config.scheduledAt,
          password: config.password,
          hasRsvp: config.hasRsvp,
          userId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setShareData({
          cardUrl: data.url,
          collabUrl: data.collabUrl,
          creatorSecret: data.creatorSecret,
          cardId: data.id,
        });
        localStorage.removeItem(`draft-${theme.id}`);
        toast.success("Card published successfully! 🎉");
      } else {
        const data = await res.json();
        toast.error(`Publishing failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      toast.error(`Error publishing card: ${String(err)}`);
    } finally {
      setPublishing(false);
    }
  };

  // Shared tool panels (Themes/Elements/Layers/Media/Stickers/Audio/AI), rendered in the
  // desktop left sidebar AND inside the mobile bottom sheet, so phones can use them too.
  const renderToolPanel = (tab: string) => (
    <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
            {tab === "layers" && <LayersPanel />}
            {tab === "timeline" && <ElementTimeline />}
            {tab === "elements" && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">Add shapes and text to the canvas</p>
                <div className="grid grid-cols-2 gap-2">
                  <div 
                    onClick={() => {
                      const newStickers = [...(useEditorStore.getState().config.stickers || [])];
                      newStickers.push({ stickerId: "text:Double click to edit", x: 50, y: 50, rotation: 0, scale: 1.2 });
                      updateField("stickers", newStickers);
                      toast.success("Added Text Element");
                    }} 
                    className="aspect-square rounded-lg bg-card border border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <Type className="w-8 h-8 text-foreground" />
                    <span className="text-[10px] text-muted-foreground">Text</span>
                  </div>
                  
                  <div 
                    onClick={() => {
                      const newStickers = [...(useEditorStore.getState().config.stickers || [])];
                      newStickers.push({ stickerId: "square", x: 50, y: 50, rotation: 0, scale: 1 });
                      updateField("stickers", newStickers);
                      toast.success("Added Square Element");
                    }} 
                    className="aspect-square rounded-lg bg-card border border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <Square className="w-8 h-8 text-foreground" />
                    <span className="text-[10px] text-muted-foreground">Square</span>
                  </div>

                  <div 
                    onClick={() => {
                      const newStickers = [...(useEditorStore.getState().config.stickers || [])];
                      newStickers.push({ stickerId: "circle", x: 50, y: 50, rotation: 0, scale: 1 });
                      updateField("stickers", newStickers);
                      toast.success("Added Circle Element");
                    }} 
                    className="aspect-square rounded-lg bg-card border border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <Circle className="w-8 h-8 text-foreground" />
                    <span className="text-[10px] text-muted-foreground">Circle</span>
                  </div>

                  <div 
                    onClick={() => {
                      const newStickers = [...(useEditorStore.getState().config.stickers || [])];
                      newStickers.push({ stickerId: "triangle", x: 50, y: 50, rotation: 0, scale: 1 });
                      updateField("stickers", newStickers);
                      toast.success("Added Triangle Element");
                    }} 
                    className="aspect-square rounded-lg bg-card border border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <svg className="w-8 h-8 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <polygon points="12,2 22,22 2,22" />
                    </svg>
                    <span className="text-[10px] text-muted-foreground">Triangle</span>
                  </div>

                  <div 
                    onClick={() => {
                      const newStickers = [...(useEditorStore.getState().config.stickers || [])];
                      newStickers.push({ stickerId: "star", x: 50, y: 50, rotation: 0, scale: 1 });
                      updateField("stickers", newStickers);
                      toast.success("Added Star Element");
                    }} 
                    className="aspect-square rounded-lg bg-card border border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <Star className="w-8 h-8 text-foreground" />
                    <span className="text-[10px] text-muted-foreground">Star</span>
                  </div>

                  <div 
                    onClick={() => {
                      const newStickers = [...(useEditorStore.getState().config.stickers || [])];
                      newStickers.push({ stickerId: "heart", x: 50, y: 50, rotation: 0, scale: 1 });
                      updateField("stickers", newStickers);
                      toast.success("Added Heart Element");
                    }} 
                    className="aspect-square rounded-lg bg-card border border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <svg className="w-8 h-8 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span className="text-[10px] text-muted-foreground">Heart</span>
                  </div>

                  <div 
                    onClick={() => {
                      const newStickers = [...(useEditorStore.getState().config.stickers || [])];
                      newStickers.push({ stickerId: "pentagon", x: 50, y: 50, rotation: 0, scale: 1 });
                      updateField("stickers", newStickers);
                      toast.success("Added Pentagon Element");
                    }} 
                    className="aspect-square rounded-lg bg-card border border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <svg className="w-8 h-8 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <polygon points="12,2 22,9 18,20 6,20 2,9" />
                    </svg>
                    <span className="text-[10px] text-muted-foreground">Pentagon</span>
                  </div>

                  <div 
                    onClick={() => {
                      const newStickers = [...(useEditorStore.getState().config.stickers || [])];
                      newStickers.push({ stickerId: "hexagon", x: 50, y: 50, rotation: 0, scale: 1 });
                      updateField("stickers", newStickers);
                      toast.success("Added Hexagon Element");
                    }} 
                    className="aspect-square rounded-lg bg-card border border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <svg className="w-8 h-8 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" />
                    </svg>
                    <span className="text-[10px] text-muted-foreground">Hexagon</span>
                  </div>

                  {[
                    { id: "diamond", label: "Diamond", points: "12,2 22,12 12,22 2,12" },
                    { id: "arrow", label: "Arrow", points: "2,9 14,9 14,4 22,12 14,20 14,15 2,15" },
                    { id: "lightning", label: "Bolt", points: "13,2 4,14 11,14 9,22 20,9 13,9" },
                    { id: "plus", label: "Cross", points: "9,2 15,2 15,9 22,9 22,15 15,15 15,22 9,22 9,15 2,15 2,9 9,9" },
                  ].map((sh) => (
                    <div
                      key={sh.id}
                      onClick={() => {
                        const ns = [...(useEditorStore.getState().config.stickers || [])];
                        ns.push({ stickerId: sh.id, x: 50, y: 50, rotation: 0, scale: 1 });
                        updateField("stickers", ns);
                        toast.success(`Added ${sh.label}`);
                      }}
                      className="aspect-square rounded-lg bg-card border border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2"
                    >
                      <svg className="w-8 h-8 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                        <polygon points={sh.points} />
                      </svg>
                      <span className="text-[10px] text-muted-foreground">{sh.label}</span>
                    </div>
                  ))}

                  <div
                    onClick={() => {
                      const ns = [...(useEditorStore.getState().config.stickers || [])];
                      ns.push({ stickerId: "speech", x: 50, y: 50, rotation: 0, scale: 1 });
                      updateField("stickers", ns);
                      toast.success("Added Speech bubble");
                    }}
                    className="aspect-square rounded-lg bg-card border border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <svg className="w-8 h-8 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 3h16a2 2 0 012 2v9a2 2 0 01-2 2H10l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2z" />
                    </svg>
                    <span className="text-[10px] text-muted-foreground">Speech</span>
                  </div>

                  <div
                    onClick={() => {
                      const ns = [...(useEditorStore.getState().config.stickers || [])];
                      ns.push({ stickerId: "pill", x: 50, y: 50, rotation: 0, scale: 1 });
                      updateField("stickers", ns);
                      toast.success("Added Pill");
                    }}
                    className="aspect-square rounded-lg bg-card border border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <div className="w-8 h-3 rounded-full bg-[#fafafa]" />
                    <span className="text-[10px] text-muted-foreground">Pill</span>
                  </div>

                  {/* Extended shape library */}
                  {[
                    { id: "rounded-square", label: "Rounded" },
                    { id: "oval", label: "Oval" },
                    { id: "octagon", label: "Octagon" },
                    { id: "chevron", label: "Chevron" },
                    { id: "shield", label: "Shield" },
                    { id: "banner", label: "Banner" },
                    { id: "sparkle4", label: "Sparkle" },
                    { id: "cloud", label: "Cloud" },
                    { id: "crescent", label: "Moon" },
                    { id: "pin", label: "Pin" },
                    { id: "gem", label: "Gem" },
                    { id: "check", label: "Check" },
                    { id: "ring", label: "Ring" },
                    { id: "star6", label: "6-Star" },
                  ].map((sh) => (
                    <div
                      key={sh.id}
                      onClick={() => {
                        const ns = [...(useEditorStore.getState().config.stickers || [])];
                        ns.push({ stickerId: sh.id, x: 50, y: 50, rotation: 0, scale: 1 });
                        updateField("stickers", ns);
                        toast.success(`Added ${sh.label}`);
                      }}
                      className="aspect-square rounded-lg bg-card border border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-1 overflow-hidden"
                    >
                      <div className="scale-[0.45] text-[#fafafa] flex items-center justify-center h-8">
                        {renderShape(sh.id, "#fafafa")}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{sh.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {tab === "ai" && (
              <div className="space-y-3">
                {!aiSettings.isConfigured() ? (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-amber-400 shrink-0" />
                      <p className="text-xs font-bold text-amber-400">AI not configured</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">Add your API key in Settings to unlock AI content generation.</p>
                    <a href="/settings" className="block w-full text-center py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-[11px] font-bold hover:bg-amber-500/30 transition-colors">
                      Go to Settings
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <p className="text-[10px] font-bold text-green-400 capitalize">{aiSettings.provider} · {aiSettings.model}</p>
                  </div>
                )}

                {/* Inline AI provider config, change the AI without leaving the editor */}
                <details className="rounded-lg border border-border bg-card/50 group" open={!aiSettings.isConfigured()}>
                  <summary className="cursor-pointer list-none px-2.5 py-2 text-[11px] font-bold text-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Bot className="w-3.5 h-3.5" /> AI Provider</span>
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <div className="px-2.5 pb-2.5 space-y-2">
                    <select
                      value={aiSettings.provider}
                      onChange={(e) => {
                        const p = e.target.value as typeof aiSettings.provider;
                        aiSettings.setProvider(p);
                        const defaults: Record<string, string> = {
                          gemini: "gemini-1.5-flash", openai: "gpt-4o-mini", anthropic: "claude-3-5-haiku-latest",
                          deepseek: "deepseek-chat", mistral: "mistral-small-latest", groq: "llama-3.1-8b-instant",
                          cohere: "command-r", perplexity: "sonar", openrouter: "openai/gpt-4o-mini",
                          ollama: "llama3.2", lmstudio: "local-model",
                        };
                        if (defaults[p]) aiSettings.setModel(defaults[p]);
                      }}
                      className="w-full bg-card border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer"
                    >
                      {[
                        ["gemini", "Google Gemini (free tier)"], ["openai", "OpenAI"], ["anthropic", "Anthropic Claude"],
                        ["deepseek", "DeepSeek"], ["mistral", "Mistral"], ["groq", "Groq"], ["cohere", "Cohere"],
                        ["perplexity", "Perplexity"], ["openrouter", "OpenRouter"], ["ollama", "Ollama (local)"], ["lmstudio", "LM Studio (local)"],
                      ].map(([v, label]) => <option key={v} value={v}>{label}</option>)}
                    </select>
                    <input
                      value={aiSettings.model}
                      onChange={(e) => aiSettings.setModel(e.target.value)}
                      placeholder="Model (e.g. gemini-1.5-flash)"
                      className="w-full bg-card border border-border rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                    {aiSettings.provider === "ollama" || aiSettings.provider === "lmstudio" ? (
                      <input
                        value={aiSettings.baseUrl}
                        onChange={(e) => aiSettings.setBaseUrl(e.target.value)}
                        placeholder="Base URL (e.g. http://localhost:11434)"
                        className="w-full bg-card border border-border rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                      />
                    ) : (
                      <input
                        type="password"
                        value={aiSettings.apiKey}
                        onChange={(e) => aiSettings.setApiKey(e.target.value)}
                        placeholder="API key"
                        className="w-full bg-card border border-border rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                      />
                    )}
                    <p className="text-[10px] text-muted-foreground leading-relaxed">Saved to this browser. <a href="/settings" className="text-primary hover:underline">Full settings →</a></p>
                  </div>
                </details>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tone</label>
                  <select
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                    className="w-full bg-card border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {["Heartfelt & Warm", "Funny & Witty", "Formal & Professional", "Poetic & Artistic", "Playful & Quirky", "Romantic", "Inspirational"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Mode</label>
                  <div className="flex gap-1">
                    {([["personalize", "Personalise card"], ["text", "Write one field"]] as const).map(([m, label]) => (
                      <button
                        key={m}
                        onClick={() => setAiMode(m)}
                        className={clsx("flex-1 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer", aiMode === m ? "bg-primary/20 border-primary text-primary" : "bg-card border-border text-muted-foreground hover:text-foreground")}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {aiMode === "personalize" && (
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      The AI knows this theme is <strong className="text-foreground">{theme.name}</strong> and will write a matching title, subtitle and message.
                    </p>
                  )}
                </div>

                {aiMode === "text" && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Apply to</label>
                    <div className="flex gap-1">
                      {(["body", "title"] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setAiTargetField(f)}
                          className={clsx("flex-1 py-1 rounded-lg text-[11px] font-bold capitalize border transition-colors cursor-pointer", aiTargetField === f ? "bg-primary/20 border-primary text-primary" : "bg-card border-border text-muted-foreground hover:text-foreground")}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {aiMode === "personalize" ? "Who / what is this card for?" : "Describe what to write"}
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="w-full h-20 bg-card border border-border rounded-lg p-2 text-xs text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary"
                    placeholder={aiMode === "personalize"
                      ? `e.g. "my sister Amaka turning 30, she loves cats and hates surprises"`
                      : `e.g. "A birthday message for my best friend who loves cats"`}
                  />
                </div>

                <Button onClick={() => { handleAIGenerate(); }} loading={generatingAI} fullWidth size="sm" className="gap-2">
                  <Sparkles className="w-3.5 h-3.5" /> Generate
                </Button>
              </div>
            )}

            {tab === "themes" && (
               <div className="space-y-4">
                 <p className="text-xs text-muted-foreground">Quick Theme Swapper</p>
                 <div className="grid grid-cols-2 gap-2 max-h-[70vh] overflow-y-auto pr-1">
                   {themeSwatches.map((t) => (
                     <div
                       key={t.id}
                       onClick={() => {
                         window.location.href = `/editor/${t.id}`;
                       }}
                       className={clsx(
                         "aspect-[4/3] rounded border p-2 flex flex-col justify-between cursor-pointer transition-colors relative overflow-hidden group",
                         t.id === theme.id ? "border-primary bg-primary/10" : "border-border bg-secondary/10 hover:border-primary/50"
                       )}
                     >
                       <span className="text-xl">{t.emoji}</span>
                       <span className="text-[10px] font-bold truncate text-foreground">{t.name}</span>
                     </div>
                   ))}
                 </div>
               </div>
            )}

            {tab === "media" && (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleMediaUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  fullWidth
                  size="sm"
                  loading={uploadingMedia}
                  className="bg-card border border-border"
                >
                  Upload Image
                </Button>
                {mediaLoading ? (
                  <div className="text-center text-xs text-muted-foreground py-4">Loading media...</div>
                ) : mediaFiles.filter(f => f.type === "photo").length === 0 ? (
                  <div className="text-center text-xs text-muted-foreground py-4">No images uploaded yet.</div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
                    {mediaFiles
                      .filter((f) => f.type === "photo")
                      .map((file) => (
                        <div
                          key={file.name}
                          className="aspect-square rounded border border-border hover:border-primary/50 overflow-hidden relative group"
                        >
                          <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 gap-1.5 z-10">
                            <button
                              onClick={() => {
                                const newStickers = [...(useEditorStore.getState().config.stickers || [])];
                                newStickers.push({ stickerId: file.url, x: 50, y: 50, rotation: 0, scale: 1.2 });
                                updateField("stickers", newStickers);
                                toast.success("Added to canvas!");
                              }}
                              className="w-full py-1 bg-primary text-primary-foreground text-[10px] font-bold rounded hover:brightness-110 cursor-pointer text-center"
                            >
                              Add to Canvas
                            </button>
                            <button
                              onClick={() => {
                                if (!theme.content.supportsMedia) {
                                  toast.warning("This theme doesn't support a cover photo slot, but you can use 'Add to Canvas' to place it anywhere!");
                                } else {
                                  updateField("mediaUrl", file.url);
                                  toast.success("Set as main photo!");
                                }
                              }}
                              className="w-full py-1 bg-secondary text-foreground text-[10px] font-bold rounded hover:bg-[#3f3f46] cursor-pointer text-center"
                            >
                              Set Main Photo
                            </button>
                            <button
                              onClick={() => setCropSrc(file.url)}
                              className="w-full py-1 bg-secondary text-foreground text-[10px] font-bold rounded hover:bg-[#3f3f46] cursor-pointer text-center"
                            >
                              Crop ✂️
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {tab === "stickers" && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">Select a category and tap to add sticker</p>
                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
                  {STICKER_CATEGORIES.map((cat) => (
                    <div key={cat.name} className="space-y-2">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{cat.name}</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {cat.stickers.map((st) => (
                          <div
                            key={st.id}
                            onClick={() => {
                              const newStickers = [...(useEditorStore.getState().config.stickers || [])];
                              newStickers.push({ stickerId: st.id, x: 50, y: 50, rotation: 0, scale: 1 });
                              updateField("stickers", newStickers);
                              toast.success(`Added ${st.label}`);
                            }}
                            className="aspect-square rounded bg-card border border-border hover:border-primary cursor-pointer flex items-center justify-center p-1.5 transition-colors group"
                            title={st.label}
                          >
                            <img
                              src={`/stickers/${st.id}.svg`}
                              alt={st.label}
                              className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {/* Fallback Emoji Category */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Emojis</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {["💖", "⭐", "🌹", "🎈", "🎉", "😀", "✨", "🔥", "🦄", "🍀", "🍰", "🎁", "🥳", "🍪", "🍷", "🍕"].map((emoji) => (
                        <div
                          key={emoji}
                          onClick={() => {
                            const newStickers = [...(useEditorStore.getState().config.stickers || [])];
                            newStickers.push({ stickerId: emoji, x: 50, y: 50, rotation: 0, scale: 1 });
                            updateField("stickers", newStickers);
                            toast.success(`Added Emoji ${emoji}`);
                          }}
                          className="aspect-square rounded bg-card border border-border hover:border-primary cursor-pointer flex items-center justify-center text-2xl"
                        >
                          {emoji}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "audio" && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">Select Background Music</p>
                <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                  {Object.values(AUDIO_PRESETS).map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => {
                        updateField("audioPreset", preset.id);
                        audioManager.loadBgMusic(preset.id, 0.5, true);
                        toast.success(`Music preset: ${preset.label} selected!`);
                      }}
                      className={clsx(
                        "p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-colors",
                        audioPreset === preset.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-secondary/10 hover:border-primary/50"
                      )}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-xs font-bold text-foreground truncate">{preset.label}</p>
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{preset.genre}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (audioManager.isBgPlaying() && audioManager.getCurrentPresetId() === preset.id) {
                            audioManager.pauseBgMusic();
                          } else {
                            audioManager.loadBgMusic(preset.id, 0.5, true);
                            audioManager.playBgMusic();
                          }
                        }}
                        className="w-7 h-7 bg-secondary hover:bg-[#3f3f46] rounded-full flex items-center justify-center shrink-0 text-foreground cursor-pointer"
                      >
                        {audioManager.isBgPlaying() && audioManager.getCurrentPresetId() === preset.id
                          ? <Pause className="w-3 h-3" />
                          : <Play className="w-3 h-3 ml-0.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
    </div>
  );

  return (
    <div className="dark w-full h-screen bg-background text-foreground flex flex-col font-sans select-none overflow-hidden relative">
      {activeDropdown && (
        <div className="fixed inset-0 z-[90]" onClick={() => setActiveDropdown(null)} />
      )}
      
      {/* Top Toolbar */}
      <header className="h-14 shrink-0 bg-background border-b border-border px-4 flex items-center justify-between z-[90]">
        <div className="flex items-center gap-3 md:gap-6 min-w-0">
          <Link href="/explore" title="Back to gallery" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity text-primary">
            <ArrowLeft className="w-4 h-4" />
            <Sparkles className="w-5 h-5 hidden sm:block" />
          </Link>
          <span className="md:hidden text-xs font-bold text-muted-foreground truncate max-w-[150px]">{theme.name}</span>
          <div className="hidden md:flex items-center gap-1 bg-card rounded-lg p-1 border border-border relative">
            <div className="relative">
              <button onClick={() => setActiveDropdown(activeDropdown === "file" ? null : "file")} className="px-3 py-1.5 rounded-md text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 active:scale-95 cursor-pointer" aria-expanded={activeDropdown === "file"} aria-haspopup="true">File</button>
              {activeDropdown === "file" && (
                <div className="absolute left-0 mt-2 w-48 rounded-lg bg-card border border-border p-1 shadow-xl z-[100] flex flex-col gap-1 text-xs">
                  <button onClick={() => { saveDraft(theme.id); toast.success("Draft saved manually!"); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 rounded hover:bg-secondary text-foreground font-bold transition-all duration-200 active:scale-95 cursor-pointer">Save Draft</button>
                  <button onClick={() => { handleDownloadPreview(); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 rounded hover:bg-secondary text-foreground font-bold transition-all duration-200 active:scale-95 cursor-pointer">Export as Image</button>
                  <button onClick={() => { setConfig(getDefaultConfig(theme)); toast.success("Reset to defaults!"); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 rounded hover:bg-destructive/20 text-destructive font-bold transition-all duration-200 active:scale-95 cursor-pointer">Reset to Defaults</button>
                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={() => setActiveDropdown(activeDropdown === "edit" ? null : "edit")} className="px-3 py-1.5 rounded-md text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 active:scale-95 cursor-pointer" aria-expanded={activeDropdown === "edit"} aria-haspopup="true">Edit</button>
              {activeDropdown === "edit" && (
                <div className="absolute left-0 mt-2 w-48 rounded-lg bg-card border border-border p-1 shadow-xl z-[100] flex flex-col gap-1 text-xs">
                  <button disabled={!canUndo} onClick={() => { undo(); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 rounded hover:bg-secondary text-foreground font-bold disabled:opacity-40 transition-all duration-200 active:scale-95 cursor-pointer">Undo</button>
                  <button disabled={!canRedo} onClick={() => { redo(); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 rounded hover:bg-secondary text-foreground font-bold disabled:opacity-40 transition-all duration-200 active:scale-95 cursor-pointer">Redo</button>
                  <button onClick={() => { updateField("stickers", []); toast.success("Stickers cleared!"); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 rounded hover:bg-secondary text-foreground font-bold transition-all duration-200 active:scale-95 cursor-pointer">Clear All Stickers</button>
                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={() => setActiveDropdown(activeDropdown === "view" ? null : "view")} className="px-3 py-1.5 rounded-md text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 active:scale-95 cursor-pointer" aria-expanded={activeDropdown === "view"} aria-haspopup="true">View</button>
              {activeDropdown === "view" && (
                <div className="absolute left-0 mt-2 w-48 rounded-lg bg-card border border-border p-1 shadow-xl z-[100] flex flex-col gap-1 text-xs">
                  <button onClick={() => { setShowSimulator(true); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 rounded hover:bg-secondary text-foreground font-bold transition-all duration-200 active:scale-95 cursor-pointer">Preview as recipient</button>
                  <button onClick={() => { setShowHelpModal(true); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 rounded hover:bg-secondary text-foreground font-bold transition-all duration-200 active:scale-95 cursor-pointer">Show Shortcuts</button>
                </div>
              )}
            </div>
            
            <div className="w-px h-4 bg-secondary mx-2" />
            <span className="text-[10px] text-muted-foreground font-mono pr-2">{theme.name} - Draft</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-3">
          <div className="hidden sm:flex items-center gap-1 border border-border bg-card rounded-lg p-0.5">
            <button disabled={!canUndo} onClick={undo} aria-label="Undo" className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 rounded-md hover:bg-secondary transition-all duration-200 active:scale-95 cursor-pointer">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
            </button>
            <button disabled={!canRedo} onClick={redo} aria-label="Redo" className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 rounded-md hover:bg-secondary transition-all duration-200 active:scale-95 cursor-pointer">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" /></svg>
            </button>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button onClick={toggleDrawMode} className={clsx("px-3 py-1.5 h-8 rounded-lg border text-xs font-bold flex items-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer", isDrawMode ? "bg-primary/20 border-primary text-primary" : "bg-card border-border hover:bg-secondary")}>
              <Pencil className="w-4 h-4" /> Draw
            </button>
            {isDrawMode && (
              <div className="flex items-center gap-2 border border-border bg-card rounded-lg p-1 h-8">
                <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="w-5 h-5 rounded cursor-pointer border-none p-0" />
                <div className="w-px h-4 bg-secondary mx-1" />
                <input type="range" min="1" max="20" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-16 accent-primary h-1 bg-secondary rounded-lg appearance-none cursor-pointer" />
              </div>
            )}
          </div>
          <button onClick={() => { triggerVibrate(20); setShowSimulator(true); }} className="px-2.5 md:px-3 py-1.5 h-8 rounded-lg border border-primary/40 bg-primary/10 text-xs font-bold text-primary hover:bg-primary/20 flex items-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer" title="Preview the full recipient experience">
            <PlayCircle className="w-4 h-4" /> <span className="hidden sm:inline">Preview</span>
          </button>
          <button onClick={() => { triggerVibrate(20); setShowHelpModal(true); }} className="hidden sm:flex px-2 py-1.5 h-8 rounded-lg bg-card border border-border text-xs font-bold hover:bg-secondary items-center gap-1 transition-all duration-200 active:scale-95 cursor-pointer" title="Help & Shortcuts">
            <span className="w-4 h-4 flex items-center justify-center font-serif italic font-bold">?</span> Help
          </button>
          <button onClick={() => { triggerVibrate(20); saveDraft(theme.id); toast.success("Draft saved!"); }} className="hidden sm:flex px-3 py-1.5 h-8 rounded-lg bg-card border border-border text-xs font-bold hover:bg-secondary items-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer" title="Save Draft">
            <Save className="w-4 h-4" /> Save
          </button>
          <Button onClick={handlePublish} disabled={publishing} size="sm" className="h-8 text-xs px-4 bg-primary text-primary-foreground hover:brightness-110 shadow-sm shadow-primary/20">
            {publishing ? "Generating..." : "Generate Link"}
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex min-h-0 relative">
        
        {/* Left Sidebar (Canva Style), desktop only */}
        <div className="hidden md:flex w-20 shrink-0 bg-background border-r border-border flex-col items-center py-4 gap-4 z-20">
          {[
            { id: "themes", icon: <Palette className="w-6 h-6" />, label: "Themes" },
            { id: "elements", icon: <Diamond className="w-6 h-6" />, label: "Elements" },
            { id: "layers", icon: <Layers className="w-6 h-6" />, label: "Layers" },
            { id: "timeline", icon: <Clock3 className="w-6 h-6" />, label: "Timeline" },
            { id: "media", icon: <ImageIcon className="w-6 h-6" />, label: "Media" },
            { id: "stickers", icon: <Sticker className="w-6 h-6" />, label: "Stickers" },
            { id: "audio", icon: <Music className="w-6 h-6" />, label: "Audio" },
            { id: "ai", icon: <Bot className="w-6 h-6" />, label: "AI Assist" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveLeftTab(tab.id)}
              className={clsx(
                "w-14 h-14 md:w-16 md:h-16 flex flex-col items-center justify-center gap-1 rounded-xl transition-colors cursor-pointer",
                activeLeftTab === tab.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-card hover:text-foreground"
              )}
            >
              <span className="text-xl md:text-2xl">{tab.icon}</span>
              <span className="text-[9px] md:text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Left Sidebar Panel Content (Collapsible/Contextual) */}
        <div className="hidden md:flex flex-col w-72 shrink-0 bg-background border-r border-border z-10 p-4">
          <h2 className="text-lg font-bold capitalize mb-4">{activeLeftTab}</h2>
          {renderToolPanel(activeLeftTab)}
        </div>

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col min-w-0 bg-background relative">
          <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />
          
          {/* Target for sticker toolbar React Portal */}
          <div id="editor-sticker-toolbar-portal" className="w-full flex justify-center py-2 shrink-0 border-b border-border bg-background/80 backdrop-blur z-30 min-h-[50px] flex-wrap gap-2 empty:hidden" />

          {/* Scenes + Zoom controls */}
          <div className="hidden md:flex w-full justify-between items-center px-4 py-1.5 shrink-0 z-30">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717a] mr-1">Scenes</span>
              {[{ id: 0, label: "Card" }, { id: 2, label: "Background" }].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveScene(s.id)}
                  className={clsx(
                    "px-3 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer",
                    activeScene === s.id
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-card border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-0.5">
              <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors transition-all duration-200 active:scale-95 cursor-pointer" title="Zoom out">
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setZoom(100)} className="px-2 py-0.5 text-[10px] font-mono font-bold text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors transition-all duration-200 active:scale-95 cursor-pointer min-w-[40px] text-center">
                {zoom}%
              </button>
              <button onClick={() => setZoom(z => Math.min(150, z + 10))} className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors transition-all duration-200 active:scale-95 cursor-pointer" title="Zoom in">
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-3 bg-secondary mx-0.5" />
              <button onClick={() => setZoom(100)} className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors transition-all duration-200 active:scale-95 cursor-pointer" title="Fit to screen">
                <Maximize className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 sm:p-8 pb-24 md:pb-8 overflow-hidden relative">
            {/* Target for floating submenus portal */}
            <div id="editor-sticker-submenu-portal" className="absolute top-4 right-4 z-40 w-64 bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 backdrop-blur-sm empty:hidden text-left" />
            <div
              className="w-[300px] sm:w-[340px] aspect-[9/18] relative shadow-2xl shadow-primary/5 rounded-[44px] overflow-hidden border-[8px] border-[#18181b] bg-black ring-1 ring-white/10 group"
              style={{ transform: `scale(${zoom / 100})`, transition: 'transform 0.2s ease-out' }}
            >
              <div ref={previewRef} className="absolute inset-0 w-full h-full pointer-events-auto" data-editor-scene={activeScene}>
                <style>{`
                  /* Scene 3 (Interact): Show only the interactive overlay and background */
                  [data-editor-scene="2"] .card-content-wrapper {
                    display: none !important;
                  }
                `}</style>
                <EditorPreviewWrapper theme={theme} />
              </div>

              {/* Draw Mode Overlay */}
              {isDrawMode && (
                <div className="absolute inset-0 z-50 pointer-events-auto">
                  <canvas ref={drawingCanvasRef} className="w-full h-full touch-none" />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-card p-1.5 rounded-xl border border-border shadow-xl">
                    <button 
                      onClick={() => {
                        if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
                          const dataUrl = signaturePadRef.current.toDataURL("image/png");
                          if (dataUrl) {
                            const newStickers = [...(useEditorStore.getState().config.stickers || [])];
                            newStickers.push({ stickerId: dataUrl, x: 50, y: 50, rotation: 0, scale: 1 });
                            updateField("stickers", newStickers);
                            toast.success("Drawing added!");
                          }
                        }
                        setIsDrawMode(false);
                      }} 
                      className="px-3 py-1.5 bg-primary/20 text-primary text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer hover:bg-primary/30"
                    >
                      <Check className="w-3 h-3" /> Done
                    </button>
                    <button
                      onClick={() => {
                        signaturePadRef.current?.clear();
                      }}
                      className="px-3 py-1.5 bg-secondary text-foreground text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer hover:bg-[#3f3f46]"
                    >
                      Clear
                    </button>
                    <button 
                      onClick={() => setIsDrawMode(false)} 
                      className="px-3 py-1.5 bg-destructive/20 text-destructive text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer hover:bg-destructive/30"
                    >
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar (Properties Panel), desktop */}
        <div className="hidden md:block md:w-80 lg:w-96 shrink-0 bg-background border-l border-border">
          <EditorSidebar theme={theme} />
        </div>
      </div>

      {/* Mobile editor controls, bottom sheet */}
      <div className="md:hidden">
          {mobileSheetOpen && (
            <div
              className="fixed inset-0 z-[70] bg-black/40"
              onClick={() => setMobileSheetOpen(false)}
            />
          )}
          <div
            className={clsx(
              "fixed inset-x-0 bottom-0 z-[80] bg-background border-t border-border rounded-t-2xl shadow-2xl flex flex-col transition-[height] duration-300 ease-out pb-[env(safe-area-inset-bottom)]",
              mobileSheetOpen ? "h-[78vh]" : "h-[max(68px,calc(68px+env(safe-area-inset-bottom)))]"
            )}
          >
            <button
              type="button"
              onClick={() => setMobileSheetOpen((o) => !o)}
              className="shrink-0 flex flex-col items-center pt-2 pb-2.5 cursor-pointer active:opacity-70"
              aria-label={mobileSheetOpen ? "Minimise editor" : "Open editor"}
            >
              <span className="w-10 h-1.5 rounded-full bg-[#3f3f46] mb-1.5" />
              <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                {mobileSheetOpen ? (
                  "Minimise editor"
                ) : (
                  <>
                    <Pencil className="w-3.5 h-3.5" /> Edit your card
                  </>
                )}
              </span>
            </button>
            {mobileSheetOpen && (
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="shrink-0 flex gap-1.5 overflow-x-auto px-3 pb-2">
                  {[
                    { id: "edit", label: "Edit" },
                    { id: "themes", label: "Themes" },
                    { id: "elements", label: "Elements" },
                    { id: "layers", label: "Layers" },
                    { id: "timeline", label: "Timeline" },
                    { id: "media", label: "Media" },
                    { id: "stickers", label: "Stickers" },
                    { id: "audio", label: "Audio" },
                    { id: "ai", label: "AI" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setMobileTab(t.id)}
                      className={clsx(
                        "shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors cursor-pointer",
                        mobileTab === t.id ? "bg-primary/20 border-primary text-primary" : "bg-card border-border text-muted-foreground"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                  {mobileTab === "edit" ? (
                    <EditorSidebar theme={theme} />
                  ) : (
                    <div className="h-full overflow-y-auto p-4 flex flex-col">{renderToolPanel(mobileTab)}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      <SimulatorWrapper
        theme={theme}
        open={showSimulator}
        onClose={() => setShowSimulator(false)}
      />

      <CropModal
        src={cropSrc || ""}
        open={!!cropSrc}
        onClose={() => setCropSrc(null)}
        onApply={(dataUrl) => {
          const newStickers = [...(useEditorStore.getState().config.stickers || [])];
          newStickers.push({ stickerId: dataUrl, x: 50, y: 50, rotation: 0, scale: 1.2 });
          updateField("stickers", newStickers);
          toast.success("Cropped image added to canvas!");
        }}
      />

      {shareData && (
        <ShareModal isOpen={true} onClose={() => setShareData(null)} cardUrl={shareData.cardUrl} collabUrl={shareData.collabUrl} themeEmoji={theme.emoji} creatorSecret={shareData.creatorSecret} cardId={shareData.cardId} />
      )}
      <Modal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} title="Keyboard Shortcuts" size="sm">
        <div className="space-y-4 py-2 text-sm text-foreground">
           <p>Ctrl + Z : Undo</p>
           <p>Ctrl + Y : Redo</p>
           <p>Esc : Close Modals</p>
        </div>
      </Modal>

      {confirmDialog && (
        <Modal
          isOpen={confirmDialog.isOpen}
          onClose={confirmDialog.onCancel}
          title={confirmDialog.title}
          size="sm"
        >
          <div className="flex flex-col gap-4 text-foreground py-2">
            <p className="text-sm text-zinc-300">
              {confirmDialog.description}
            </p>
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={confirmDialog.onCancel}
                className="px-4 py-2 bg-secondary text-foreground text-xs font-bold rounded-lg hover:bg-[#3f3f46] transition-colors cursor-pointer"
              >
                No, Discard
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-primary/20"
              >
                Yes, Save Drawing
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default EditorLayout;
