import { NextRequest, NextResponse } from "next/server";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { getCard } from "@/lib/db/cards";
import { getThemeById } from "@/lib/themes/registry";

interface RouteParams {
  params: Promise<{ cardId: string }>;
}

const FONT_URL = "https://cdnjs.cloudflare.com/ajax/libs/inter-ui/3.19.3/web/Inter-Regular.woff";

// Cache the in-flight promise, not just the result: concurrent cold requests otherwise each
// fetch the font. A failed fetch is not cached, so the next request retries instead of being
// stuck with a permanently broken buffer.
let fontPromise: Promise<ArrayBuffer> | null = null;

async function getFontData(): Promise<ArrayBuffer> {
  if (fontPromise) return fontPromise;

  fontPromise = (async () => {
    // The original code never checked res.ok, so a CDN error page was happily cached as
    // "font data" for the lifetime of the process, breaking every OG image afterwards.
    const res = await fetch(FONT_URL, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) {
      throw new Error(`Font fetch failed: ${res.status}`);
    }
    const buf = await res.arrayBuffer();
    if (buf.byteLength === 0) {
      throw new Error("Font fetch returned an empty body");
    }
    return buf;
  })();

  try {
    return await fontPromise;
  } catch (err) {
    fontPromise = null; // allow a retry on the next request
    throw err;
  }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { cardId } = await params;
    const card = await getCard(cardId);
    
    if (!card) {
      return new NextResponse("Card not found", { status: 404 });
    }

    const theme = getThemeById(card.theme_id);
    const emoji = theme?.emoji || "🎉";

    // A passcode-protected card must not have its title/recipient/sender rendered into a
    // public, cacheable image: the OG endpoint is unauthenticated, so that leaked exactly the
    // content the passcode is meant to withhold.
    const isLocked = !!card.password_hash;
    const title = isLocked
      ? "A private card is waiting"
      : (card.config.title as string) || theme?.content.title || "Greeting Card";
    const recipient = isLocked ? "you" : (card.config.recipient as string) || "Someone Special";
    const sender = isLocked ? "someone special" : (card.config.sender as string) || "Anonymous";

    const palette = card.config.palette || {
      primary: "#00f0ff",
      secondary: "#ff007f",
      accent: "#ffff00",
      background: "#0c0f1d",
      text: "#ffffff",
      textSecondary: "#a0aec0",
    };

    const bgVal = palette.background;
    const backgroundStyle = Array.isArray(bgVal)
      ? `linear-gradient(135deg, ${bgVal.join(", ")})`
      : bgVal;

    const fontData = await getFontData();

    // Render Satori Markup
    const svg = await satori(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          background: backgroundStyle,
          color: palette.text,
          padding: "60px",
          fontFamily: "Inter",
          boxSizing: "border-box",
        }}
      >
        {/* Top Header */}
        <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "24px", fontWeight: "bold", color: palette.accent }}>CelebrationCraft</span>
          <span style={{ fontSize: "32px" }}>{emoji}</span>
        </div>

        {/* Center Card Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "40px 60px",
            borderRadius: "24px",
            maxWidth: "800px",
          }}
        >
          <span style={{ fontSize: "16px", textTransform: "uppercase", letterSpacing: "2px", color: palette.textSecondary, marginBottom: "15px" }}>
            For {recipient}
          </span>
          <h1 style={{ fontSize: "50px", fontWeight: "900", color: palette.primary, margin: 0, lineHeight: 1.2 }}>
            {title}
          </h1>
          <span style={{ fontSize: "18px", color: palette.textSecondary, marginTop: "20px" }}>
            From the heart of {sender}
          </span>
        </div>

        {/* Bottom CTA */}
        <div style={{ display: "flex", fontSize: "16px", color: palette.textSecondary }}>
          Open to view interactive reveal & background music
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Inter",
            data: fontData,
            weight: 400,
            style: "normal",
          },
        ],
      }
    );

    // Convert SVG to PNG
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: "width",
        value: 1200,
      },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    return new NextResponse(pngBuffer as BodyInit, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("OG Image generation error:", err);
    return new NextResponse("Failed to generate image", { status: 500 });
  }
}
