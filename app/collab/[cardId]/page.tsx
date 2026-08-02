"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import SignaturePad from "signature_pad";
import { triggerVibrate } from "@/lib/utils/device";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SavedCard } from "@/lib/themes/types";
import { useRealtimeContributions } from "@/lib/hooks/useRealtimeContributions";

export default function CollabPage() {
  const params = useParams();
  const router = useRouter();
  const cardId = params?.cardId as string;

  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState<SavedCard | null>(null);
  const { contributions } = useRealtimeContributions(cardId, []);
  const contributionsCount = contributions.length;

  // Collab Gate passcode states
  const [passcodeRequired, setPasscodeRequired] = useState(false);
  const [passcodeUnlocked, setPasscodeUnlocked] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [voiceUrl, setVoiceUrl] = useState("");
  const [signatureData, setSignatureData] = useState("");

  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sigPadRef = useRef<SignaturePad | null>(null);

  // Fetch card config on mount
  useEffect(() => {
    if (!cardId) return;

    const fetchCard = async () => {
      try {
        const res = await fetch(`/api/cards/${cardId}`);
        if (!res.ok) {
          router.push("/");
          return;
        }

        const data = await res.json();
        const cardData = data.card;

        if (!cardData.is_collaborative) {
          router.push(`/c/${cardId}`);
          return;
        }

        setCard(cardData);

        if (cardData.collab_password) {
          setPasscodeRequired(true);
        } else {
          setPasscodeUnlocked(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [cardId, router]);

  // Init signature pad when unlocked
  useEffect(() => {
    if (passcodeUnlocked && canvasRef.current) {
      sigPadRef.current = new SignaturePad(canvasRef.current, {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        penColor: "rgb(0, 0, 0)",
      });
      sigPadRef.current.addEventListener("endStroke", () => {
        setSignatureData(sigPadRef.current?.toDataURL() || "");
      });
    }
  }, [passcodeUnlocked]);

  // Handle image upload
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      triggerVibrate(30);
      setUploading(true);
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload/photo", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          setPhotoUrl(data.url);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setUploading(false);
      }
    },
  });

  // Handle voice recording
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
        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        try {
          const res = await fetch("/api/upload/voice", { method: "POST", body: formData });
          if (res.ok) {
            const data = await res.json();
            setVoiceUrl(data.url);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setUploading(false);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      console.error(err);
    }
  };

  const stopRecording = () => {
    triggerVibrate(50);
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setRecording(false);
    }
  };

  const handleVerifyPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerVibrate(30);
    try {
      const res = await fetch(`/api/cards/${cardId}/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passcodeInput, type: "collab" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasscodeUnlocked(true);
        setPasscodeError(false);
      } else {
        setPasscodeError(true);
      }
    } catch (err) {
      console.error("Collab passcode verification error", err);
      setPasscodeError(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerVibrate(50);
    if (!name.trim() || !message.trim()) return;

    setUploading(true);
    try {
      const res = await fetch(`/api/cards/${cardId}/contributions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          message,
          signature: signatureData,
          photoUrl,
          voiceUrl,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  if (loading || !card) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-background text-muted-foreground gap-4">
        <LoadingSpinner size="lg" />
        <span className="text-xs font-mono">Loading group card details...</span>
      </div>
    );
  }

  const limitReached = card.max_contributors && contributionsCount >= card.max_contributors;

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative select-none">
      <div className="absolute inset-0 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

      {/* ==================== PASSCODE GATE ==================== */}
      {passcodeRequired && !passcodeUnlocked && (
        <form
          onSubmit={handleVerifyPasscode}
          className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl text-center space-y-6 z-10"
        >
          <span className="text-4xl block">🔒</span>
          <div className="space-y-1">
            <h2 className="text-base font-black">Co-Sign Request</h2>
            <p className="text-xs text-muted-foreground">Enter contribution passcode to participate.</p>
          </div>
          <div className="space-y-2">
            <input
              type="password"
              placeholder="Passcode"
              value={passcodeInput}
              onChange={(e) => setPasscodeInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-center text-sm focus:border-primary focus:outline-none transition font-black tracking-wider"
            />
            {passcodeError && (
              <span className="text-[10px] text-red-500 font-bold block">Incorrect passcode. Try again.</span>
            )}
          </div>
          <Button type="submit" className="w-full bg-primary hover:brightness-110 text-primary-foreground font-black">
            Enter Form ➔
          </Button>
        </form>
      )}

      {/* ==================== SUBMISSION FORM ==================== */}
      {passcodeUnlocked && !submitted && (
        <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 shadow-2xl relative z-10">
          <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-lg font-black flex items-center gap-1.5">
                <span>👥</span> Co-Sign Card
              </h2>
              <p className="text-xs text-muted-foreground">Add your messages and sketches to this group card.</p>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">
              {contributionsCount} / {card.max_contributors} signed
            </span>
          </div>

          {limitReached ? (
            <div className="py-10 text-center text-muted-foreground space-y-2">
              <span className="text-3xl block">🚫</span>
              <h4 className="text-sm font-bold text-foreground">Signer Limit Reached</h4>
              <p className="text-xs text-muted-foreground leading-normal max-w-xs mx-auto">
                Sorry, this card has already reached its limit of {card.max_contributors} signatures.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Grandma, Uncle Dave"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:border-primary focus:outline-none transition"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Wishes / Comments</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write something sweet or memory sharing..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:border-primary focus:outline-none transition resize-none leading-relaxed"
                />
              </div>

              {/* Image attachment drops */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Photo Attachment (Optional)</label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed p-4 rounded-xl text-center cursor-pointer transition select-none flex flex-col items-center justify-center gap-1 ${
                    isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-border bg-background/20"
                  }`}
                >
                  <input {...getInputProps()} />
                  <p className="text-xs font-bold text-foreground">Upload Image</p>
                  <p className="text-[9px] text-muted-foreground">Max 5MB</p>
                </div>
                {photoUrl && (
                  <div className="relative w-full h-20 rounded-lg overflow-hidden border border-border mt-2 bg-black/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoUrl} alt="attachment-preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl("")}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 text-white flex items-center justify-center text-[10px]"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Handwriting signature pad */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Draw Signature (Optional)</label>
                <div className="relative border border-border rounded-xl overflow-hidden bg-white/95">
                  <canvas ref={canvasRef} className="w-full h-28 touch-none" />
                  <button
                    type="button"
                    onClick={() => {
                      sigPadRef.current?.clear();
                      setSignatureData("");
                    }}
                    className="absolute bottom-1 right-1 px-2.5 py-0.5 bg-black/80 hover:bg-black text-[9px] font-bold rounded cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Voice recording */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Voice Memo Attachment (Optional)</label>
                <div className="flex items-center gap-3 bg-background p-3 rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={recording ? stopRecording : startRecording}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs shadow-lg cursor-pointer ${
                      recording ? "bg-red-600 animate-pulse text-white" : "bg-primary text-primary-foreground font-bold"
                    }`}
                  >
                    {recording ? "⏹" : "🎤"}
                  </button>
                  <div className="flex-1">
                    <span className="text-[11px] font-bold block">{recording ? "Recording..." : "Voice note"}</span>
                    <span className="text-[9px] text-muted-foreground font-mono">Max 30s</span>
                  </div>
                </div>
                {voiceUrl && (
                  <div className="w-full bg-background p-2.5 rounded-lg border border-border flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground font-mono font-bold">✓ Voice memo attached successfully</span>
                    <button type="button" onClick={() => setVoiceUrl("")} className="text-red-400 font-bold hover:text-red-300">
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                disabled={uploading}
                className="w-full bg-primary hover:brightness-110 text-primary-foreground font-black mt-4"
              >
                {uploading ? "Submitting..." : "Sign Card 🖋️"}
              </Button>
            </form>
          )}
        </div>
      )}

      {/* ==================== SUCCESS SCREEN ==================== */}
      {submitted && (
        <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl text-center space-y-6 z-10">
          <span className="text-5xl block animate-bounce">✍️</span>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-foreground">Signature Added!</h2>
            <p className="text-xs text-muted-foreground leading-normal">
              Your wishes have been added successfully to the group card!
            </p>
          </div>

          <Button
            onClick={() => {
              triggerVibrate(20);
              router.push(`/c/${cardId}`);
            }}
            className="w-full bg-primary hover:brightness-110 text-primary-foreground font-black"
          >
            View Full Card ➔
          </Button>
        </div>
      )}
    </div>
  );
}
