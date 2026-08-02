import { ThemePalette } from "../themes/types";

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanedHex = hex.replace("#", "");
  if (cleanedHex.length === 3) {
    cleanedHex = cleanedHex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  const num = parseInt(cleanedHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
  );
}

export function getContrastColor(hex: string): "#000000" | "#ffffff" {
  const { r, g, b } = hexToRgb(hex);
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  const luminance = 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  return luminance > 0.179 ? "#000000" : "#ffffff";
}

export function adjustBrightness(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r + amount, g + amount, b + amount);
}

export function applyPaletteToCSS(palette: ThemePalette, element: HTMLElement): void {
  element.style.setProperty("--color-primary", palette.primary);
  element.style.setProperty("--color-secondary", palette.secondary);
  element.style.setProperty("--color-accent", palette.accent);
  element.style.setProperty("--color-text", palette.text);
  element.style.setProperty("--color-text-secondary", palette.textSecondary);

  if (Array.isArray(palette.background)) {
    element.style.setProperty(
      "--color-bg",
      `linear-gradient(135deg, ${palette.background.join(", ")})`
    );
  } else {
    element.style.setProperty("--color-bg", palette.background);
  }
}

export function generateHarmonicPalette(baseHex: string): ThemePalette {
  const rgb = hexToRgb(baseHex);
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  const hslToHex = (hVal: number, sVal: number, lVal: number): string => {
    let rVal = lVal;
    let gVal = lVal;
    let bVal = lVal;
    if (sVal !== 0) {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = lVal < 0.5 ? lVal * (1 + sVal) : lVal + sVal - lVal * sVal;
      const p = 2 * lVal - q;
      rVal = hue2rgb(p, q, hVal + 1 / 3);
      gVal = hue2rgb(p, q, hVal);
      bVal = hue2rgb(p, q, hVal - 1 / 3);
    }
    return rgbToHex(rVal * 255, gVal * 255, bVal * 255);
  };

  const secondary = hslToHex((h + 30 / 360) % 1, Math.max(0.2, s * 0.7), Math.min(0.9, l * 1.1));
  const accent = hslToHex((h + 180 / 360) % 1, Math.min(1.0, s * 1.2), Math.max(0.4, Math.min(0.7, l)));
  const background = hslToHex(h, Math.max(0.1, s * 0.2), 0.97);
  const text = hslToHex(h, Math.max(0.3, s * 0.4), 0.15);
  const textSecondary = hslToHex(h, Math.max(0.1, s * 0.2), 0.45);

  return {
    primary: baseHex,
    secondary,
    accent,
    background,
    text,
    textSecondary,
  };
}
