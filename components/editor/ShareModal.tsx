"use client";

import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerVibrate } from "@/lib/utils/device";
import { copyToClipboard } from "@/lib/utils/sharing";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardUrl: string;
  collabUrl?: string;
  themeEmoji?: string;
  creatorSecret?: string;
  cardId?: string;
}

export function ShareModal({
  isOpen,
  onClose,
  cardUrl,
  collabUrl,
  themeEmoji = "🎉",
  creatorSecret,
  cardId,
}: ShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCollab, setCopiedCollab] = useState(false);
  const [copiedDashboard, setCopiedDashboard] = useState(false);
  const [supportsWebShare, setSupportsWebShare] = useState(false);

  const dashboardUrl = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/dashboard/${cardId || cardUrl.split("/").pop()}?secret=${creatorSecret}`;
  }, [cardId, cardUrl, creatorSecret]);

  // Check for Web Share API support
  useEffect(() => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      setSupportsWebShare(true);
    }
  }, []);

  const handleCopyLink = async (url: string, type: "recipient" | "collab" | "dashboard") => {
    triggerVibrate(40);
    const success = await copyToClipboard(url);
    if (success) {
      if (type === "recipient") {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else if (type === "collab") {
        setCopiedCollab(true);
        setTimeout(() => setCopiedCollab(false), 2000);
      } else {
        setCopiedDashboard(true);
        setTimeout(() => setCopiedDashboard(false), 2000);
      }
    }
  };

  const handleNativeShare = async () => {
    triggerVibrate(40);
    try {
      await navigator.share({
        title: "CelebrationCraft Greeting Card",
        text: `Check out this personalised digital celebration card! ${themeEmoji}`,
        url: cardUrl,
      });
    } catch (e) {
      console.warn("Native share cancelled or failed", e);
    }
  };

  // Convert SVG QR Code to PNG and trigger local browser download
  const handleDownloadQR = () => {
    triggerVibrate(45);
    const svgElement = document.querySelector("#qr-code-svg-element");
    if (!svgElement) return;

    try {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const DOMURL = window.URL || window.webkitURL || window;
      const url = DOMURL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Fill white background
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, 300, 300);
          ctx.drawImage(img, 10, 10, 280, 280);
          
          const pngUrl = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = pngUrl;
          downloadLink.download = "celebration-qr-code.png";
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
        DOMURL.revokeObjectURL(url);
      };
      img.src = url;
    } catch (err) {
      console.error("Failed to download QR code image", err);
    }
  };

  const shareTargets = [
    {
      name: "WhatsApp",
      icon: (
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.09-3.985l.411.244c1.61.956 3.805 1.461 5.451 1.463 5.485 0 9.948-4.415 9.95-9.848.001-2.632-1.02-5.106-2.875-6.963C17.27 3.056 14.81 2.03 12.19 2.03c-5.462 0-9.919 4.414-9.922 9.846 0 1.884.5 3.722 1.447 5.348l.268.459-1.049 3.832 3.931-1.038zM16.9 14.39c-.264-.132-1.564-.772-1.806-.859-.242-.087-.419-.131-.595.132-.176.264-.681.859-.835 1.034-.154.176-.308.197-.573.065-.264-.132-1.117-.412-2.13-1.312-.787-.701-1.319-1.567-1.473-1.831-.154-.264-.016-.407.116-.539.119-.118.264-.308.396-.462.132-.154.176-.264.264-.44.088-.176.044-.33-.022-.462-.066-.132-.595-1.433-.815-1.962-.215-.518-.43-.448-.595-.456-.153-.008-.33-.009-.507-.009-.176 0-.462.066-.704.33-.242.264-.925.903-.925 2.202 0 1.299.946 2.553 1.078 2.73 1.309 1.761 2.457 2.728 4.747 3.633.545.215 1.066.353 1.46.478.618.197 1.181.169 1.625.103.495-.073 1.564-.639 1.784-1.256.22-.617.22-1.146.154-1.256-.066-.109-.242-.175-.506-.308z" />
        </svg>
      ),
      bgColor: "bg-emerald-600 hover:bg-emerald-500",
      getUrl: (url: string) => `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this interactive celebration card! ${url}`)}`,
    },
    {
      name: "Telegram",
      icon: (
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
          <path d="M23.91 2.012l-3.41 16.06c-.25 1.15-.93 1.43-1.89.89l-5.2-3.83-2.51 2.41c-.28.28-.51.51-.83.51l.37-5.3 9.64-8.71c.42-.37-.09-.58-.65-.21l-11.91 7.5-5.14-1.61c-1.12-.35-1.14-1.12.23-1.65l20.09-7.74c.93-.34 1.74.21 1.44 1.84z" />
        </svg>
      ),
      bgColor: "bg-sky-600 hover:bg-sky-500",
      getUrl: (url: string) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Check out this interactive card! ${themeEmoji}`)}`,
    },
    {
      name: "Twitter / X",
      icon: (
        <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      bgColor: "bg-zinc-800 hover:bg-zinc-700",
      getUrl: (url: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`I designed an interactive celebration card! Check it out! ${themeEmoji}`)}`,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Your Card is Live! 🎉"
      description="Share it instantly with the recipient, invite co-signers, or access your creator stats dashboard."
      size="lg"
    >
      <div className="space-y-6 py-2 select-none">
        
        {/* Main Card Link */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            Recipient Card Link (Send this to the recipient)
          </label>
          <div className="flex gap-2 bg-secondary/30 border border-border p-2 rounded-xl items-center">
            <span className="text-xs text-foreground truncate flex-1 font-mono px-2 select-all">
              {cardUrl}
            </span>
            <Button
              onClick={() => handleCopyLink(cardUrl, "recipient")}
              size="sm"
              className="font-bold shrink-0 min-h-[36px]"
            >
              <AnimatePresence mode="wait">
                {copiedLink ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-1 text-emerald-400 font-bold"
                  >
                    Copied! ✓
                  </motion.span>
                ) : (
                  <span key="copy">Copy Link</span>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>

        {/* Collab Link if available */}
        {collabUrl && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              👥 Group Contribution Link (Share with co-signers)
            </label>
            <div className="flex gap-2 bg-primary/5 border border-primary/20 p-2 rounded-xl items-center">
              <span className="text-xs text-primary truncate flex-1 font-mono px-2 select-all">
                {collabUrl}
              </span>
              <Button
                onClick={() => handleCopyLink(collabUrl, "collab")}
                size="sm"
                variant="outline"
                className="font-bold shrink-0 min-h-[36px] hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <AnimatePresence mode="wait">
                  {copiedCollab ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="text-emerald-400 font-bold"
                    >
                      Copied! ✓
                    </motion.span>
                  ) : (
                    <span key="copy">Copy Link</span>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        )}

        {/* Private Dashboard Link Warning Alert */}
        {creatorSecret && (
          <div className="space-y-2">
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 flex flex-col sm:flex-row items-start gap-4">
              <div className="text-2xl select-none shrink-0 mt-0.5">⚠️</div>
              <div className="space-y-2 flex-1 w-full">
                <h4 className="text-sm font-bold text-destructive">Private Creator Dashboard Link (Save this!)</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Bookmark or copy this private link. This is the **only way** to access your dashboard to view card reads, reactions, signatures, and RSVP replies. It cannot be recovered.
                </p>
                <div className="flex gap-2 bg-card border border-border p-2 rounded-xl items-center w-full">
                  <span className="text-xs text-muted-foreground truncate flex-1 font-mono px-2 select-all">
                    {dashboardUrl}
                  </span>
                  <Button
                    onClick={() => handleCopyLink(dashboardUrl, "dashboard")}
                    size="sm"
                    variant="outline"
                    className="font-bold shrink-0 min-h-[36px]"
                  >
                    <AnimatePresence mode="wait">
                      {copiedDashboard ? (
                        <motion.span
                          key="check"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="text-emerald-500 font-bold"
                        >
                          Copied! ✓
                        </motion.span>
                      ) : (
                        <span key="copy">Copy Link</span>
                      )}
                    </AnimatePresence>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Code and Social Actions Grid */}
        <div className="flex flex-col sm:flex-row gap-6 items-stretch pt-2">
          
          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-between p-4 bg-white rounded-2xl border border-zinc-200 shadow-sm shrink-0 gap-3">
            <div className="qr-code-container">
              <QRCodeSVG id="qr-code-svg-element" value={cardUrl} size={120} level="H" includeMargin={true} />
            </div>
            <button
              onClick={handleDownloadQR}
              className="text-[10px] font-bold text-zinc-500 hover:text-zinc-800 transition-colors uppercase tracking-wider font-mono hover:underline cursor-pointer select-none"
            >
              📥 Download QR Code
            </button>
          </div>

          {/* Social / Native Sharing Buttons */}
          <div className="flex-1 flex flex-col justify-between gap-3 w-full">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Share Instantly
            </span>
            
            <div className="flex flex-col gap-2">
              {/* Native Mobile App Share */}
              {supportsWebShare && (
                <button
                  onClick={handleNativeShare}
                  className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-extrabold bg-primary text-primary-foreground hover:brightness-110 shadow transition cursor-pointer"
                >
                  <span>📱</span>
                  <span>Share with Phone Apps</span>
                </button>
              )}

              <div className="grid grid-cols-3 gap-2">
                {shareTargets.map((target) => (
                  <a
                    key={target.name}
                    href={target.getUrl(cardUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => triggerVibrate(30)}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl text-[10px] font-bold transition text-white ${target.bgColor}`}
                  >
                    <span className="text-xl">{target.icon}</span>
                    <span>{target.name}</span>
                  </a>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground leading-normal font-mono select-none pt-2 border-t border-border/80">
              * Active for 90 days. Media attachments are optimized automatically.
            </p>
          </div>

        </div>

      </div>
    </Modal>
  );
}

export default ShareModal;
