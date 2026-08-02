"use client";

import React, { useRef, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import SignaturePad from "signature_pad";
import { HexColorPicker } from "react-colorful";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Theme, CardConfig, AudioPresetId, DeliveryStyle } from "@/lib/themes/types";
import { AUDIO_PRESETS } from "@/lib/themes/audio-presets";
import { DELIVERY_PRESETS } from "@/lib/themes/delivery-presets";
import { APP_CONFIG } from "@/lib/config/app-config";
import { getFontCategories, loadFont } from "@/lib/utils/fonts";
import { triggerVibrate } from "@/lib/utils/device";
import { useEditorStore } from "@/lib/editor/store";
import { audioManager } from "@/lib/audio/manager";
import { getDefaultConfig } from "@/lib/editor/defaults";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { Select } from "@/components/ui/Select";
import { Slider } from "@/components/ui/Slider";
import { Toggle } from "@/components/ui/Toggle";
import { useUserId } from "@/lib/hooks/useUserId";
import { useToast } from "@/components/ui/ToastQueue";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ExperienceEditor } from "./ExperienceEditor";
import { BrandKitSection } from "./BrandKitSection";
import { Type, Palette, Image as ImageIcon, Music, Users, Gift, Mic, Camera, Square, Play, Lock, Unlock, ArrowDown, ArrowUp, Trash2, Wand2 } from "lucide-react";

interface EditorSidebarProps {
  theme: Theme;
}

interface AccordionSectionProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function AccordionSection({ title, icon, isOpen, onToggle, children }: AccordionSectionProps) {
  const [isFullyOpen, setIsFullyOpen] = useState(isOpen);

  useEffect(() => {
    if (!isOpen) {
      setIsFullyOpen(false);
    }
  }, [isOpen]);

  return (
    <div className={clsx(
      "border border-border/80 rounded-2xl bg-card/40 backdrop-blur-sm transition-all duration-200 shadow-sm hover:border-border",
      isFullyOpen ? "overflow-visible" : "overflow-hidden"
    )}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between font-bold text-sm text-foreground hover:bg-secondary/40 transition cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center shrink-0">{icon}</span>
          <span className="font-heading tracking-wide">{title}</span>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-muted-foreground shrink-0 text-xs"
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            onAnimationComplete={() => {
              if (isOpen) {
                setIsFullyOpen(true);
              }
            }}
            className={isFullyOpen ? "overflow-visible" : "overflow-hidden"}
          >
            <div className="px-5 pb-5 pt-1 space-y-4 border-t border-border/40 text-foreground">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function EditorSidebar({ theme }: EditorSidebarProps) {
  const userId = useUserId();
  const toast = useToast();
  const { config, updateField, commitHistory, resetToDefaults } = useEditorStore();
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const voiceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isPro, setIsPro] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [deliveryAnimateCompleted, setDeliveryAnimateCompleted] = useState(false);

  useEffect(() => {
    if (config.deliveryStyle === "none") {
      setDeliveryAnimateCompleted(false);
    }
  }, [config.deliveryStyle]);

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
      }
    };
    checkRole();
  }, [userId]);

  const executeMockUpgrade = async () => {
    if (userId?.startsWith("anon_")) return;
    try {
      const res = await fetch("/api/auth/profile", {
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
  
  // Custom Color Picker states
  const [activeColorKey, setActiveColorKey] = useState<string | null>(null);

  // Accordion Sections State
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personalisation: true,
    experience: true,
  });

  // Inline Validation States
  const [errors, setErrors] = useState<{ recipient?: string; sender?: string }>({});

  // Font loading state
  const [loadingFont, setLoadingFont] = useState<string | null>(null);

  // Signature Pad Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);

  const toggleSection = (sectionId: string) => {
    triggerVibrate(15);
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Initialize Signature Pad when Media Section is active
  useEffect(() => {
    if (openSections.media && canvasRef.current) {
      const pad = new SignaturePad(canvasRef.current, {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        penColor: "rgb(0, 0, 0)",
      });
      signaturePadRef.current = pad;
      
      // Load existing drawing if it exists in state
      const existingData = useEditorStore.getState().config.handwritingData;
      if (existingData) {
        pad.fromDataURL(existingData);
      }

      pad.addEventListener("endStroke", () => {
        const dataUrl = pad.toDataURL("image/png");
        if (dataUrl) {
          updateField("handwritingData", dataUrl);
        }
      });
    }
    return () => {
      signaturePadRef.current?.off();
      signaturePadRef.current = null;
    };
  }, [openSections.media, updateField]);

  // Handle image drops
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    maxSize: APP_CONFIG.uploads.maxPhotoSizeBytes,
    onDropRejected: () => {
      toast.error(`Max file size is ${Math.round(APP_CONFIG.uploads.maxPhotoSizeBytes / 1024 / 1024)}MB`);
    },
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      triggerVibrate(30);
      const file = acceptedFiles[0];

      // Form Data upload
      const formData = new FormData();
      formData.append("file", file);
      if (userId) {
        formData.append("userId", userId);
      }

      try {
        const res = await fetch("/api/upload/photo", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          updateField("mediaUrl", data.url);
          toast.success("Photo uploaded successfully!");
        } else {
          console.error("Upload failed");
          toast.error("Failed to upload photo. Please try again.");
        }
      } catch (err) {
        console.error("Upload error", err);
        toast.error("Network error during photo upload.");
      }
    },
  });

  // Voice Recording Methods
  const startRecording = async () => {
    try {
      triggerVibrate(50);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([audioBlob], "voice.webm", { type: "audio/webm" });

        // Upload voice
        const formData = new FormData();
        formData.append("file", file);
        if (userId) {
          formData.append("userId", userId);
        }

        try {
          const res = await fetch("/api/upload/voice", {
            method: "POST",
            body: formData,
          });
          if (res.ok) {
            const data = await res.json();
            updateField("voiceUrl", data.url);
            toast.success("Voice recorded successfully!");
          } else {
            console.error("Voice upload failed");
            toast.error("Failed to upload voice. Please try again.");
          }
        } catch (err) {
          console.error(err);
          toast.error("Network error during voice upload.");
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);

      voiceTimeoutRef.current = setTimeout(() => {
        recorder.stop();
        recorder.stream.getTracks().forEach((track) => track.stop());
        setRecording(false);
        toast.info(`Voice limit reached (${APP_CONFIG.uploads.maxVoiceDurationSec}s)`);
      }, APP_CONFIG.uploads.maxVoiceDurationSec * 1000);
    } catch (err) {
      console.error("Permission denied or microphone missing", err);
      toast.error("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    triggerVibrate(50);
    if (voiceTimeoutRef.current) {
      clearTimeout(voiceTimeoutRef.current);
      voiceTimeoutRef.current = null;
    }
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setRecording(false);
    }
  };

  // Preview Audio Presets
  const handlePlayAudioPreset = (presetId: AudioPresetId) => {
    triggerVibrate(20);
    audioManager.loadBgMusic(presetId, 0.8, true);
    audioManager.playBgMusic();
  };

  const handleStopAudioPreview = () => {
    triggerVibrate(20);
    audioManager.pauseBgMusic();
  };

  // Blur validators for inline errors
  const handleBlurRecipient = () => {
    if (!config.recipient?.trim()) {
      setErrors((prev) => ({ ...prev, recipient: "Recipient is required to generate the card." }));
    } else {
      setErrors((prev) => ({ ...prev, recipient: undefined }));
    }
  };

  const handleBlurSender = () => {
    if (!config.sender?.trim()) {
      setErrors((prev) => ({ ...prev, sender: "Sender is required to generate the card." }));
    } else {
      setErrors((prev) => ({ ...prev, sender: undefined }));
    }
  };

  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    updateField("recipient", val);
    if (val.trim() && errors.recipient) {
      setErrors((prev) => ({ ...prev, recipient: undefined }));
    }
  };

  const handleSenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    updateField("sender", val);
    if (val.trim() && errors.sender) {
      setErrors((prev) => ({ ...prev, sender: undefined }));
    }
  };

  // Prepare categorized fonts list as flat option array for Select component
  const fontOptions = React.useMemo(() => {
    return getFontCategories().flatMap((cat) =>
      cat.fonts.map((f) => ({
        value: f,
        label: `${cat.category} — ${f}`,
      }))
    );
  }, []);

  const handleHeadingFontChange = async (selected: string) => {
    triggerVibrate(15);
    setLoadingFont(selected);
    try {
      await loadFont(selected);
      updateField("fontHeading", selected);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFont(null);
    }
  };

  const handleBodyFontChange = async (selected: string) => {
    triggerVibrate(15);
    setLoadingFont(selected);
    try {
      await loadFont(selected);
      updateField("fontBody", selected);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFont(null);
    }
  };

  // Prepare delivery style options for Select component
  const deliveryOptions = React.useMemo(() => {
    if (!theme.delivery) return [];
    return theme.delivery.allowedStyles
      .filter((style) => style !== "none")
      .map((style) => {
        const meta = DELIVERY_PRESETS[style];
        return {
          value: style,
          label: meta ? meta.name : style,
        };
      });
  }, [theme.delivery]);

  return (
    <div className="w-full h-full flex flex-col bg-card border-l border-border text-foreground select-none">
      
      {/* Scrollable Accordion Wrapper */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        
        {/* Accordion 1: Personalisation */}
        <AccordionSection
          title="Personalisation"
          icon={<Type className="w-4 h-4 text-primary" />}
          isOpen={!!openSections.personalisation}
          onToggle={() => toggleSection("personalisation")}
        >
          <Input
            label="Recipient Name"
            value={config.recipient}
            maxLength={APP_CONFIG.features.maxRecipientLength}
            showCharCounter={true}
            onChange={handleRecipientChange}
            onBlur={handleBlurRecipient}
            placeholder="e.g. John Doe"
            error={errors.recipient}
            success={!!config.recipient && !errors.recipient}
          />

          <Input
            label="Sender Name"
            value={config.sender}
            maxLength={APP_CONFIG.features.maxSenderLength}
            showCharCounter={true}
            onChange={handleSenderChange}
            onBlur={handleBlurSender}
            placeholder="e.g. Jane Doe"
            error={errors.sender}
            success={!!config.sender && !errors.sender}
          />

          <Input
            label="Card Title"
            value={config.title}
            maxLength={APP_CONFIG.features.maxTitleLength}
            showCharCounter={true}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="e.g. Happy Birthday!"
          />

          <Input
            label="Subtitle (Optional)"
            value={config.subtitle}
            maxLength={APP_CONFIG.features.maxTitleLength * 2}
            showCharCounter={true}
            onChange={(e) => updateField("subtitle", e.target.value)}
            placeholder="e.g. Wishing you the best day ever..."
          />

          <TextArea
            label="Message Body"
            value={config.body}
            maxLength={APP_CONFIG.features.maxNoteLength}
            showCharCounter={true}
            onChange={(e) => updateField("body", e.target.value)}
            placeholder="Write your heartfelt message here..."
            rows={5}
          />

          {theme.interactive && (
            <div className="space-y-4 pt-4 border-t border-border/40">
              <span className="text-xs font-bold text-foreground block">
                Interactive Text Overrides
              </span>
              <Input
                label="Main Action Button"
                value={config.ctaYesText ?? ""}
                onChange={(e) => updateField("ctaYesText", e.target.value)}
                placeholder={theme.content.cta?.yesText || "e.g. Open"}
                maxLength={30}
              />
              <Input
                label="Action Prompt"
                value={config.ctaPromptText ?? ""}
                onChange={(e) => updateField("ctaPromptText", e.target.value)}
                placeholder={theme.content.cta?.promptText || "e.g. Tap to reveal!"}
                maxLength={60}
              />
            </div>
          )}
        </AccordionSection>

        {/* Experience: structure controls unique to this mini-app (only for experience themes) */}
        {theme.experienceId && (
          <AccordionSection
            title="Experience"
            icon={<Wand2 className="w-4 h-4 text-primary" />}
            isOpen={!!openSections.experience}
            onToggle={() => toggleSection("experience")}
          >
            <ExperienceEditor theme={theme} />
          </AccordionSection>
        )}

        {/* Accordion 2: Style */}
        <AccordionSection
          title="Style"
          icon={<Palette className="w-4 h-4 text-primary" />}
          isOpen={!!openSections.style}
          onToggle={() => toggleSection("style")}
        >
          {/* Custom Color Palette Editor */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-muted-foreground block">
              Custom Color Palette
            </span>
            
            <div className="grid grid-cols-3 gap-2.5">
              {Object.entries(config.palette).map(([colorKey, colorVal]) => {
                const val = Array.isArray(colorVal) ? colorVal[0] : colorVal;
                return (
                  <div
                    key={colorKey}
                    className={clsx(
                      "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border cursor-pointer transition-all hover:bg-secondary/40",
                      activeColorKey === colorKey ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card/40"
                    )}
                    onClick={() => {
                      triggerVibrate(15);
                      setActiveColorKey(activeColorKey === colorKey ? null : colorKey);
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full border border-foreground/10 shadow-inner"
                      style={{ backgroundColor: val }}
                    />
                    <span className="text-[10px] font-bold text-muted-foreground capitalize text-center">
                      {colorKey.replace(/([A-Z])/g, " $1")}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground/80">{val}</span>
                  </div>
                );
              })}
            </div>

            {/* Color Picker Popover */}
            <AnimatePresence>
              {activeColorKey && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 5 }}
                  className="bg-card border border-border p-4 rounded-2xl flex flex-col items-center gap-3 relative mt-2 shadow-lg"
                  onPointerUp={() => commitHistory()}
                >
                  <button
                    type="button"
                    onClick={() => setActiveColorKey(null)}
                    className="absolute top-2.5 right-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    ✕
                  </button>
                  <HexColorPicker
                    color={
                      Array.isArray(config.palette[activeColorKey as keyof CardConfig["palette"]])
                        ? (config.palette[activeColorKey as keyof CardConfig["palette"]] as string[])[0]
                        : (config.palette[activeColorKey as keyof CardConfig["palette"]] as string)
                    }
                    onChange={(newColor) => {
                      const currentPalette = { ...config.palette };
                      (currentPalette as Record<string, string | string[]>)[activeColorKey] = newColor;
                      updateField("palette", currentPalette, true); // skip history during drag
                    }}
                  />
                  <span className="text-[10px] font-mono font-bold text-muted-foreground">
                    Editing: {activeColorKey.toUpperCase()}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Typography Selectors */}
          <div className="space-y-4 pt-4 border-t border-border/40">
            <div className="space-y-1">
              <Select
                label="Heading Typography"
                options={fontOptions}
                value={config.fontHeading}
                onChange={handleHeadingFontChange}
                placeholder="Select a font"
              />
              {loadingFont === config.fontHeading && (
                <p className="text-[10px] text-muted-foreground animate-pulse pl-1">
                  🔄 Loading font styles...
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Select
                label="Body Text Typography"
                options={fontOptions}
                value={config.fontBody}
                onChange={handleBodyFontChange}
                placeholder="Select a font"
              />
              {loadingFont === config.fontBody && (
                <p className="text-[10px] text-muted-foreground animate-pulse pl-1">
                  🔄 Loading font styles...
                </p>
              )}
            </div>
          </div>

          {/* Animation Toggle */}
          <div className="flex justify-between items-center pt-4 border-t border-border/40">
            <div className="flex-1 pr-2">
              <span className="text-xs font-bold text-foreground block">
                Enable Animations
              </span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                Allows interactive canvases, particles, and fireworks.
              </span>
            </div>
            <Toggle
              checked={config.animationsEnabled}
              onChange={(val) => {
                triggerVibrate(20);
                updateField("animationsEnabled", val);
              }}
              size="md"
            />
          </div>

          {/* Emotional Tone */}
          <div className="pt-4 border-t border-border/40 space-y-2">
            <Slider
              label="Emotional Tone"
              min={0}
              max={100}
              value={config.emotionalTone ?? 50}
              onChange={(val) => {
                updateField("emotionalTone", val);
                // Higher tone = gentler motion & smaller bursts; lower = livelier
                const speed = val < 34 ? "fast" : val > 66 ? "slow" : "normal";
                updateField("animationSpeed", speed, true);
              }}
            />
            <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
              <span>🎉 Playful</span>
              <span>💛 Heartfelt</span>
            </div>
          </div>

          <BrandKitSection />
        </AccordionSection>

        {/* Accordion 3: Media */}
        <AccordionSection
          title="Media"
          icon={<ImageIcon className="w-4 h-4 text-primary" />}
          isOpen={!!openSections.media}
          onToggle={() => toggleSection("media")}
        >
          {/* Photo Attachment if theme supports it */}
          {theme.content.supportsMedia && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground block">
                Photo Attachment
              </span>
              <div
                {...getRootProps()}
                className={clsx(
                  "w-full p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition select-none flex flex-col items-center justify-center gap-2",
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/45 bg-card/20"
                )}
              >
                <input {...getInputProps()} />
                <Camera className="w-6 h-6 text-muted-foreground" />
                <p className="text-xs font-bold text-foreground">
                  {isDragActive ? "Drop image here!" : "Drag & Drop or Click to upload"}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono">Max 5MB • PNG, JPG, WEBP</p>
              </div>

              {config.mediaUrl && (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-border mt-2 bg-secondary/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={config.mediaUrl}
                    alt="upload-preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      triggerVibrate(20);
                      updateField("mediaUrl", "");
                    }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/80 hover:bg-black/90 text-white flex items-center justify-center cursor-pointer text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Handwriting Signature */}
          {theme.content.supportsHandwriting && (
            <div className="space-y-2.5 border-t border-border/40 pt-4">
              <span className="text-xs font-bold text-muted-foreground block">
                Draw Signature (Optional)
              </span>
              <div className="relative border border-border rounded-2xl overflow-hidden bg-white/95">
                <canvas ref={canvasRef} className="w-full h-36 touch-none" />
                <button
                  type="button"
                  onClick={() => {
                    triggerVibrate(20);
                    signaturePadRef.current?.clear();
                    updateField("handwritingData", "");
                  }}
                  className="absolute bottom-2.5 right-2.5 px-3 py-1.5 bg-black/80 hover:bg-black text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
                >
                  Clear Drawing
                </button>
              </div>
            </div>
          )}

          {/* Voice Recording */}
          {theme.content.supportsVoice && (
            <div className="space-y-2.5 border-t border-border/40 pt-4">
              <span className="text-xs font-bold text-muted-foreground block">
                Voice Memo Attachment
              </span>
              
              <div className="flex items-center gap-4 bg-secondary/20 p-4 rounded-2xl border border-border/80">
                <button
                  type="button"
                  onClick={recording ? stopRecording : startRecording}
                  className={clsx(
                    "w-12 h-12 rounded-full flex items-center justify-center shadow-md cursor-pointer transition-all shrink-0",
                    recording
                      ? "bg-destructive hover:bg-destructive/95 text-white animate-pulse"
                      : "bg-primary hover:bg-primary/95 text-primary-foreground"
                  )}
                >
                  {recording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold block truncate text-foreground">
                    {recording ? "Recording Voice..." : "Microphone Clip"}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {recording ? "Max 30 seconds" : "Tap button to record memo"}
                  </span>
                </div>
              </div>

              {config.voiceUrl && (
                <div className="w-full bg-secondary/15 p-3 rounded-xl border border-border/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => audioManager.playSfx(config.voiceUrl!)}
                      className="w-7 h-7 bg-secondary hover:bg-muted text-foreground border border-border rounded-full flex items-center justify-center text-xs cursor-pointer transition"
                    >
                      ▶
                    </button>
                    <span className="text-[10px] text-muted-foreground font-mono">Play recorded voice note</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      triggerVibrate(20);
                      updateField("voiceUrl", "");
                    }}
                    className="text-xs text-destructive hover:text-destructive/90 font-bold"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Stickers Pack Editor */}
          {theme.editable.stickers && (
            <div className="space-y-4 border-t border-border/40 pt-4">
              <span className="text-xs font-bold text-muted-foreground block">
                🎨 Add Stickers & Text
              </span>
              <motion.div
                initial={{ boxShadow: "0 0 0 0 rgba(147, 51, 234, 0.7)" }}
                animate={{ boxShadow: ["0 0 0 0 rgba(147, 51, 234, 0)", "0 0 0 10px rgba(147, 51, 234, 0)", "0 0 0 0 rgba(147, 51, 234, 0)"] }}
                transition={{ duration: 2, repeat: 2, ease: "easeOut", delay: 1 }}
                className="mb-3 rounded-xl"
              >
                <button
                  type="button"
                  onClick={() => {
                    triggerVibrate(20);
                    const newTextSticker = {
                      stickerId: "text:Drag me anywhere!",
                      x: 50,
                      y: 50,
                      rotation: 0,
                      scale: 1,
                      isLocked: false
                    };
                    updateField("stickers", [...(config.stickers || []), newTextSticker]);
                  }}
                  className="w-full py-3 px-4 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <Type className="w-4 h-4" /> Add Freestanding Text
                </button>
              </motion.div>
              <div className="grid grid-cols-6 gap-2 bg-secondary/20 p-2.5 rounded-xl border border-border">
                {[
                  { id: "heart-classic", emoji: "💖" },
                  { id: "star-classic", emoji: "⭐" },
                  { id: "flower-rose", emoji: "🌹" },
                  { id: "celebration-balloon", emoji: "🎈" },
                  { id: "celebration-popper", emoji: "🎉" },
                  { id: "emoji-smile", emoji: "😀" }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      triggerVibrate(20);
                      const newSticker = {
                        stickerId: st.id,
                        x: 50,
                        y: 50,
                        rotation: 0,
                        scale: 1
                      };
                      updateField("stickers", [...(config.stickers || []), newSticker]);
                    }}
                    className="w-10 h-10 bg-card rounded-lg flex items-center justify-center text-lg hover:bg-secondary border border-border transition cursor-pointer"
                  >
                    {st.emoji}
                  </button>
                ))}
              </div>

              {/* Layers Panel (Placed Stickers) */}
              {config.stickers && config.stickers.length > 0 && (
                <div className="space-y-3 mt-4 pt-4 border-t border-border/40">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1">
                      Layers ({config.stickers.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        triggerVibrate(20);
                        updateField("stickers", []);
                      }}
                      className="text-[10px] text-destructive hover:underline font-bold"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1 text-foreground scrollbar-thin">
                    {config.stickers.map((st, idx) => (
                      <div key={idx} className="bg-card/60 border border-border p-3.5 rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono font-bold capitalize text-primary">
                            {st.stickerId.startsWith("text:") ? 'Text' : st.stickerId.startsWith("data:") ? 'Media' : st.stickerId.replace("-", " ")}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (idx > 0) {
                                  triggerVibrate(15);
                                  const updated = [...config.stickers];
                                  const temp = updated[idx];
                                  updated[idx] = updated[idx - 1];
                                  updated[idx - 1] = temp;
                                  updateField("stickers", updated);
                                }
                              }}
                              disabled={idx === 0}
                              className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
                              title="Send Backward"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (idx < config.stickers.length - 1) {
                                  triggerVibrate(15);
                                  const updated = [...config.stickers];
                                  const temp = updated[idx];
                                  updated[idx] = updated[idx + 1];
                                  updated[idx + 1] = temp;
                                  updateField("stickers", updated);
                                }
                              }}
                              disabled={idx === config.stickers.length - 1}
                              className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
                              title="Bring Forward"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                triggerVibrate(15);
                                const updated = [...config.stickers];
                                updated[idx] = { ...updated[idx], isLocked: !updated[idx].isLocked };
                                updateField("stickers", updated);
                              }}
                              className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                              title={st.isLocked ? "Unlock Layer" : "Lock Layer"}
                            >
                              {st.isLocked ? <Lock className="w-3.5 h-3.5 text-orange-400" /> : <Unlock className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                triggerVibrate(15);
                                const updated = config.stickers.filter((_, sIdx) => sIdx !== idx);
                                updateField("stickers", updated);
                              }}
                              className="p-1 text-destructive hover:text-destructive/80 font-bold cursor-pointer"
                              title="Delete Layer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {st.stickerId.startsWith("text:") && (
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-muted-foreground block">Text Color</span>
                              <div className="flex gap-2">
                                <input
                                  type="color"
                                  value={(st as any).color || "#ffffff"}
                                  onChange={(e) => {
                                    const updated = config.stickers.map((item, sIdx) =>
                                      sIdx === idx ? { ...item, color: e.target.value } : item
                                    );
                                    updateField("stickers", updated);
                                  }}
                                  className="w-8 h-8 rounded-md cursor-pointer border-0 p-0 bg-transparent"
                                />
                                <div className="flex-1 text-xs flex items-center font-mono opacity-50">
                                  {(st as any).color || "Default"}
                                </div>
                              </div>
                            </div>
                          )}

                          {(st.stickerId.startsWith("data:") || st.stickerId.startsWith("http") || st.stickerId.startsWith("/")) && (
                            <div className="space-y-1">
                              <Select
                                label="Image Filter"
                                options={[
                                  { value: "none", label: "No Filter" },
                                  { value: "1977", label: "1977 (Retro)" },
                                  { value: "aden", label: "Aden (Pastel)" },
                                  { value: "inkwell", label: "Inkwell (B&W)" },
                                  { value: "valencia", label: "Valencia (Warm)" },
                                  { value: "toaster", label: "Toaster (Aged)" }
                                ]}
                                value={st.props?.presetFilter || "none"}
                                onChange={(val) => {
                                  const updated = config.stickers.map((item, sIdx) =>
                                    sIdx === idx ? { ...item, props: { ...item.props, presetFilter: val === "none" ? undefined : val } } : item
                                  );
                                  updateField("stickers", updated);
                                }}
                              />
                            </div>
                          )}

                          {/* X Position */}
                          <Slider
                            label="Horizontal (X) %"
                            min={0}
                            max={100}
                            value={st.x}
                            onChange={(val) => {
                              const updated = config.stickers.map((item, sIdx) =>
                                sIdx === idx ? { ...item, x: val } : item
                              );
                              updateField("stickers", updated);
                            }}
                          />
                          
                          {/* Y Position */}
                          <Slider
                            label="Vertical (Y) %"
                            min={0}
                            max={100}
                            value={st.y}
                            onChange={(val) => {
                              const updated = config.stickers.map((item, sIdx) =>
                                sIdx === idx ? { ...item, y: val } : item
                              );
                              updateField("stickers", updated);
                            }}
                          />

                          {/* Rotation */}
                          <Slider
                            label="Rotation °"
                            min={0}
                            max={360}
                            value={st.rotation}
                            onChange={(val) => {
                              const updated = config.stickers.map((item, sIdx) =>
                                sIdx === idx ? { ...item, rotation: val } : item
                              );
                              updateField("stickers", updated);
                            }}
                          />

                          {/* Scale */}
                          <Slider
                            label="Scale"
                            min={50}
                            max={300}
                            value={Math.round(st.scale * 100)}
                            onChange={(val) => {
                              const updated = config.stickers.map((item, sIdx) =>
                                sIdx === idx ? { ...item, scale: val / 100 } : item
                              );
                              updateField("stickers", updated);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </AccordionSection>

        {/* Accordion 4: Audio */}
        <AccordionSection
          title="Audio"
          icon={<Music className="w-4 h-4 text-primary" />}
          isOpen={!!openSections.audio}
          onToggle={() => toggleSection("audio")}
        >
          <div className="space-y-4">
            <span className="text-xs font-bold text-muted-foreground block">
              Background Music
            </span>

            {/* Volume Slider */}
            <div className="bg-secondary/20 border border-border p-4 rounded-2xl space-y-1">
              <Slider
                label="Volume"
                min={0}
                max={100}
                value={Math.round(config.audioVolume * 100)}
                onChange={(val) => {
                  updateField("audioVolume", val / 100);
                  audioManager.setBgVolume(val / 100);
                }}
              />
            </div>

            {/* Music List */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
              {Object.values(AUDIO_PRESETS).map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    triggerVibrate(15);
                    updateField("audioPreset", preset.id);
                  }}
                  className={clsx(
                    "p-3.5 rounded-xl border transition cursor-pointer flex justify-between items-center",
                    config.audioPreset === preset.id
                      ? "bg-primary/10 border-primary/40 shadow-sm"
                      : "bg-card/40 border-border/80 hover:border-border"
                  )}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-foreground truncate">{preset.label}</span>
                      <span className="text-[9px] bg-secondary/80 border border-border px-1.5 py-0.5 rounded font-mono text-muted-foreground font-semibold">
                        {preset.genre}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayAudioPreset(preset.id);
                      }}
                      className="w-7 h-7 bg-secondary hover:bg-muted border border-border rounded-full flex items-center justify-center text-[10px] text-foreground transition-colors cursor-pointer"
                      title="Preview track"
                    >
                      ▶
                    </button>
                    {config.audioPreset === preset.id && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStopAudioPreview();
                        }}
                        className="w-7 h-7 bg-primary/15 border border-primary/30 rounded-full flex items-center justify-center text-[10px] text-primary transition-colors cursor-pointer"
                        title="Stop preview"
                      >
                        ■
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AccordionSection>

        {/* Accordion 5: Collaboration */}
        <AccordionSection
          title="Collaboration"
          icon={<Users className="w-4 h-4 text-primary" />}
          isOpen={!!openSections.collaboration}
          onToggle={() => toggleSection("collaboration")}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex-1 pr-2">
                <span className="text-xs font-bold text-foreground block">
                  Collaborative Group Card
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  Allow friends to add signatures and messages.
                </span>
              </div>
              <Toggle
                checked={!!config.isCollaborative}
                onChange={(val) => {
                  triggerVibrate(20);
                  updateField("isCollaborative", val);
                }}
              />
            </div>

            <AnimatePresence>
              {config.isCollaborative && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden space-y-4 pt-2 border-t border-border/40"
                >
                  <Input
                    label="Max Co-Signers"
                    type="number"
                    min={2}
                    max={100}
                    value={config.maxContributors || 20}
                    onChange={(e) => updateField("maxContributors", parseInt(e.target.value) || 20)}
                  />
                  
                  <Input
                    label="Passcode protect contributions (Optional)"
                    type="password"
                    placeholder="Leave blank for open contribution"
                    value={config.collabPassword || ""}
                    onChange={(e) => updateField("collabPassword", e.target.value)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </AccordionSection>

        {/* Accordion 6: Delivery & Advanced */}
        <AccordionSection
          title="Delivery & Advanced"
          icon={<Gift className="w-4 h-4 text-primary" />}
          isOpen={!!openSections.delivery}
          onToggle={() => toggleSection("delivery")}
        >
          {/* RSVP Settings */}
          <div className="flex justify-between items-center">
            <div className="flex-1 pr-2">
              <span className="text-xs font-bold text-foreground block">
                Recipient RSVP Panel
              </span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                Embed an RSVP response form at the bottom.
              </span>
            </div>
            <Toggle
              checked={!!config.hasRsvp}
              onChange={(val) => {
                triggerVibrate(20);
                updateField("hasRsvp", val);
              }}
            />
          </div>

          {/* Surprise Mode */}
          <div className="flex justify-between items-center border-t border-border/40 pt-4">
            <div className="flex-1 pr-2">
              <span className="text-xs font-bold text-foreground block">
                Surprise Mode 🎁
              </span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                Add a &quot;tap to open&quot; suspense gate before the reveal.
              </span>
            </div>
            <Toggle
              checked={!!config.surpriseMode}
              onChange={(val) => {
                triggerVibrate(20);
                updateField("surpriseMode", val);
              }}
            />
          </div>

          {/* Dynamic Time-of-Day */}
          <div className="flex justify-between items-center border-t border-border/40 pt-4">
            <div className="flex-1 pr-2">
              <span className="text-xs font-bold text-foreground block">
                Dynamic Time of Day 🌗
              </span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                Tints the card to match the recipient&apos;s local time when they open it.
              </span>
            </div>
            <Toggle
              checked={!!config.dynamicTime}
              onChange={(val) => {
                triggerVibrate(20);
                updateField("dynamicTime", val);
              }}
            />
          </div>

          {/* Opening Animation / Delivery Settings */}
          {theme.editable.deliveryStyle && (
            <div className="space-y-4 border-t border-border/40 pt-4">
              <div className="flex justify-between items-center">
                <div className="flex-1 pr-2">
                  <span className="text-xs font-bold text-foreground block">
                    Disable Intro Animation
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    Skip opening animation and show card immediately.
                  </span>
                </div>
                <Toggle
                  checked={config.deliveryStyle === "none"}
                  onChange={(checked) => {
                    triggerVibrate(20);
                    if (checked) {
                      updateField("deliveryStyle", "none");
                    } else {
                      const defaultStyle = theme.delivery.defaultStyle || "envelope";
                      updateField("deliveryStyle", defaultStyle === "none" ? "envelope" : defaultStyle);
                    }
                  }}
                />
              </div>

              <AnimatePresence>
                {config.deliveryStyle !== "none" && deliveryOptions.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onAnimationComplete={() => {
                      if (config.deliveryStyle !== "none") {
                        setDeliveryAnimateCompleted(true);
                      }
                    }}
                    className={clsx(deliveryAnimateCompleted ? "overflow-visible" : "overflow-hidden", "pt-2")}
                  >
                    <Select
                      label="Animation Style"
                      options={deliveryOptions}
                      value={config.deliveryStyle}
                      onChange={(selected) => {
                        triggerVibrate(15);
                        updateField("deliveryStyle", selected as DeliveryStyle);
                      }}
                      placeholder="Select delivery style"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Scheduled Release Date */}
          <div className="space-y-1.5 border-t border-border/40 pt-4">
            <Input
              label="Scheduled Delivery Date (Optional)"
              type="datetime-local"
              value={config.scheduledAt || ""}
              onChange={(e) => updateField("scheduledAt", e.target.value)}
              helperText="The card will display a dynamic countdown timer until this date."
            />
          </div>

          {/* Password Protection */}
          <div className="space-y-1.5 border-t border-border/40 pt-4">
            <Input
              label="Access Passcode (Optional)"
              type="password"
              placeholder="Passcode required to open the card"
              value={config.password || ""}
              onChange={(e) => updateField("password", e.target.value)}
              helperText="Locks the card behind a high-security visual passcode gate."
            />
          </div>

          {/* Interactive Settings if theme is interactive */}
          {theme.interactive && (
            <div className="bg-secondary/10 border border-border/60 p-4 rounded-2xl space-y-4 border-t pt-4">
              <span className="text-xs font-bold text-primary block border-b border-border/40 pb-2">
                🎮 Interactive Button Prompts
              </span>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Yes Option text"
                  type="text"
                  value={config.ctaYesText}
                  onChange={(e) => updateField("ctaYesText", e.target.value)}
                  placeholder="Yes"
                />
                <Input
                  label="No Option text"
                  type="text"
                  value={config.ctaNoText}
                  onChange={(e) => updateField("ctaNoText", e.target.value)}
                  placeholder="No"
                />
              </div>
              <Input
                label="Prompt Question (e.g. Will you be mine?)"
                type="text"
                value={config.ctaPromptText || ""}
                onChange={(e) => updateField("ctaPromptText", e.target.value)}
                placeholder="Leave blank for theme default"
              />
            </div>
          )}
        </AccordionSection>

      </div>

      {/* Footer Controls with Reset Theme */}
      <div className="p-4 border-t border-border bg-card shrink-0 flex items-center justify-end">
        <button
          type="button"
          onClick={() => {
            triggerVibrate(15);
            resetToDefaults(getDefaultConfig(theme));
          }}
          className="text-xs text-muted-foreground hover:text-foreground hover:underline transition font-semibold"
        >
          Reset Theme Defaults
        </button>
      </div>

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
            Invite friends to write messages, draw signatures, and upload media to this card!
          </p>
          {userId && !userId.startsWith("anon_") ? (
            <Button 
              onClick={executeMockUpgrade}
              fullWidth
            >
              Upgrade to Pro (Mock)
            </Button>
          ) : (
            <p className="text-xs text-amber-500 font-semibold bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg">
              Please sign in or create an account in the sidebar navbar to subscribe to Pro!
            </p>
          )}
          <Button 
            variant="ghost"
            onClick={() => setShowUpsellModal(false)}
            fullWidth
          >
            Maybe Later
          </Button>
        </div>
      </Modal>

    </div>
  );
}
