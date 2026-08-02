export const FONT_PACKAGE_MAP: Record<string, string> = {
  // Romantic / Elegant
  "Cormorant Garamond": "@fontsource/cormorant-garamond",
  "Playfair Display": "@fontsource/playfair-display",
  "EB Garamond": "@fontsource/eb-garamond",
  "Cinzel Decorative": "@fontsource/cinzel-decorative",
  Lora: "@fontsource/lora",

  // Modern / Clean
  Inter: "@fontsource/inter",
  "DM Sans": "@fontsource/dm-sans",
  "Plus Jakarta Sans": "@fontsource/plus-jakarta-sans",
  Outfit: "@fontsource/outfit",
  "Space Grotesk": "@fontsource/space-grotesk",

  // Playful / Fun
  "Fredoka One": "@fontsource/fredoka-one",
  Nunito: "@fontsource/nunito",
  Pacifico: "@fontsource/pacifico",
  Righteous: "@fontsource/righteous",
  "Baloo 2": "@fontsource/baloo-2",

  // Bold / Display
  "Bebas Neue": "@fontsource/bebas-neue",
  Rajdhani: "@fontsource/rajdhani",
  "Black Han Sans": "@fontsource/black-han-sans",
  Bungee: "@fontsource/bungee",
  "Archivo Black": "@fontsource/archivo-black",

  // Cultural / Decorative
  "Noto Serif JP": "@fontsource/noto-serif-jp",
  "Noto Serif KR": "@fontsource/noto-serif-kr",
  "Noto Sans Arabic": "@fontsource/noto-sans-arabic",
  Amiri: "@fontsource/amiri",
  "Noto Serif Devanagari": "@fontsource/noto-serif-devanagari",

  // Handwritten / Casual
  "Dancing Script": "@fontsource/dancing-script",
  Caveat: "@fontsource/caveat",
  Kalam: "@fontsource/kalam",
  "Patrick Hand": "@fontsource/patrick-hand",
  Satisfy: "@fontsource/satisfy",
};

export async function loadFont(fontName: string): Promise<void> {
  if (typeof window === "undefined") return;

  const linkId = `font-link-${fontName.toLowerCase().replace(/\s+/g, "-")}`;
  if (document.getElementById(linkId)) return;

  return new Promise<void>((resolve, reject) => {
    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.crossOrigin = "anonymous";

    const formattedFont = fontName.replace(/\s+/g, "+");
    link.href = `https://fonts.googleapis.com/css2?family=${formattedFont}:wght@400;500;700&display=swap`;

    link.onload = () => resolve();
    link.onerror = (err) => {
      console.error(`Failed to load font: ${fontName}`, err);
      reject(err);
    };

    document.head.appendChild(link);
  });
}

export function getFontCategories(): { category: string; fonts: string[] }[] {
  return [
    {
      category: "Romantic / Elegant",
      fonts: ["Cormorant Garamond", "Playfair Display", "EB Garamond", "Cinzel Decorative", "Lora"],
    },
    {
      category: "Modern / Clean",
      fonts: ["Inter", "DM Sans", "Plus Jakarta Sans", "Outfit", "Space Grotesk"],
    },
    {
      category: "Playful / Fun",
      fonts: ["Fredoka One", "Nunito", "Pacifico", "Righteous", "Baloo 2"],
    },
    {
      category: "Bold / Display",
      fonts: ["Bebas Neue", "Rajdhani", "Black Han Sans", "Bungee", "Archivo Black"],
    },
    {
      category: "Cultural / Decorative",
      fonts: [
        "Noto Serif JP",
        "Noto Serif KR",
        "Noto Sans Arabic",
        "Amiri",
        "Noto Serif Devanagari",
      ],
    },
    {
      category: "Handwritten / Casual",
      fonts: ["Dancing Script", "Caveat", "Kalam", "Patrick Hand", "Satisfy"],
    },
  ];
}
