export function buildWhatsAppUrl(message: string, url: string): string {
  const text = `${message} ${url}`.trim();
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

export function buildSMSUrl(message: string, url: string): string {
  const body = `${message} ${url}`.trim();
  // SMS scheme works on both iOS and Android (body parameter is standard now)
  return `sms:?body=${encodeURIComponent(body)}`;
}

export function buildEmailUrl(subject: string, body: string): string {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildTwitterUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function buildTelegramUrl(text: string, url: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

export function buildFacebookUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined" || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Clipboard copy failed", err);
    return false;
  }
}

export function canUseWebShare(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  return typeof navigator.share === "function";
}

export function canShareFiles(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined" || !navigator.canShare) return false;
  return true;
}
