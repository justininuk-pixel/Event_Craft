import { NextRequest, NextResponse } from "next/server";
import { isIP } from "node:net";
import dns from "node:dns/promises";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// Static mapping of hosted provider endpoints — client-supplied baseUrl is ignored for hosted providers
const HOSTED_ENDPOINTS: Record<string, string> = {
  openai: "https://api.openai.com/v1/chat/completions",
  deepseek: "https://api.deepseek.com/chat/completions",
  mistral: "https://api.mistral.ai/v1/chat/completions",
  groq: "https://api.groq.com/openai/v1/chat/completions",
  perplexity: "https://api.perplexity.ai/chat/completions",
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
  anthropic: "https://api.anthropic.com/v1/messages",
  gemini: "https://generativelanguage.googleapis.com",
  cohere: "https://api.cohere.ai/v1/chat",
};

/**
  Normalizes and resolves target hostname via DNS before checking loopback range.
  Reconstructs origin using the RESOLVED IP literal to prevent DNS rebinding (TOCTOU) attacks.
  Note: Pinning to an IP literal means HTTPS connections against IP origins would fail TLS cert 
  hostname verification unless cert covers the IP literal. Since local engines (Ollama/LM Studio) 
  operate over local HTTP (http://127.0.0.1:PORT), IP literal pinning is secure and ideal.
 */
export async function validateLocalBaseUrl(urlStr: string): Promise<string> {
  if (!urlStr || typeof urlStr !== "string") {
    throw new Error("Missing or invalid base URL");
  }

  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    throw new Error("Invalid base URL format");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Unsupported protocol in base URL");
  }

  const host = parsed.hostname;
  let resolvedIp: string;

  if (isIP(host)) {
    resolvedIp = host;
  } else {
    try {
      const { address } = await dns.lookup(host);
      resolvedIp = address;
    } catch {
      throw new Error("Could not resolve base URL hostname");
    }
  }

  // Normalize IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1 -> 127.0.0.1)
  const normalizedIp = resolvedIp.replace(/^::ffff:/i, "");

  const isLoopback =
    normalizedIp === "127.0.0.1" ||
    normalizedIp === "::1" ||
    normalizedIp.startsWith("127.");

  if (!isLoopback) {
    throw new Error("Custom AI endpoint must resolve to a local loopback address (127.0.0.1 / ::1)");
  }

  // Reconstruct origin using the RESOLVED IP literal to pin the destination and prevent DNS rebinding TOCTOU attacks
  const formattedIp = normalizedIp.includes(":") ? `[${normalizedIp}]` : normalizedIp;
  return `${parsed.protocol}//${formattedIp}${parsed.port ? ":" + parsed.port : ""}`;
}

function sanitizeErrorMessage(): string {
  return "AI request failed. Please check your provider settings and try again.";
}

export async function POST(req: NextRequest) {
  let providerName = "unknown";

  // Rate limiting check: Only trust X-Forwarded-For if running behind a trusted reverse proxy (Vercel/Cloudflare) or TRUSTED_PROXY=true
  const trustProxy = process.env.TRUSTED_PROXY === "true" || process.env.VERCEL === "1";
  const forwarded = req.headers.get("x-forwarded-for");
  const clientIp = trustProxy && forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
  
  const limitResult = await checkRateLimit(clientIp, {
    endpoint: "api_ai",
    windowMs: 60 * 1000,
    maxRequests: 10,
  });

  if (!limitResult.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again in a minute." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { provider, apiKey, model, baseUrl, userName, category, tone, context, mode, theme, about } = body;
    if (provider) providerName = provider;

    if (!provider || !model) {
      return NextResponse.json({ error: "Missing provider or model configuration" }, { status: 400 });
    }

    const nameContext = userName ? `The user's name is ${userName}. Address them nicely if appropriate, or keep it in mind.` : "";

    let systemPrompt: string;
    let userPrompt: string;

    if (mode === "personalize") {
      systemPrompt = `You write the content for an interactive digital greeting card.
THE THEME THE CARD USES: "${theme?.name ?? "Celebration card"}" — ${theme?.description ?? ""}${theme?.mechanic ? `\nHOW IT WORKS FOR THE RECIPIENT: ${theme.mechanic}` : ""}
${nameContext}
The tone should be ${tone || "heartfelt"}.
Write content that fits this specific theme's mechanic and vibe.
Respond with ONLY a valid JSON object — no prose, no markdown fences — in exactly this shape:
{"title": "short card title, max 60 chars", "subtitle": "one-line subtitle, max 120 chars", "body": "the personal message, 2-5 sentences"}`;
      userPrompt = `Write the card content for: ${about || context || "a special someone"}`;
    } else {
      systemPrompt = `You are an expert greeting card and event message writer.
${nameContext}
You are tasked with writing a message for a ${category}.
The tone should be ${tone}.
${context ? `Additional context from the user: ${context}` : ''}
Keep the message concise, heartfelt, and perfectly suited for the occasion. Do not include introductory or concluding conversational filler (like "Here is your message:"). Just output the final message.`;
      userPrompt = `Please generate the ${category} message in a ${tone} tone.`;
    }

    let endpoint = "";
    if (provider === "ollama" || provider === "lmstudio") {
      const safeOrigin = await validateLocalBaseUrl(baseUrl);
      endpoint = provider === "ollama" ? `${safeOrigin}/api/chat` : `${safeOrigin}/v1/chat/completions`;
    } else if (HOSTED_ENDPOINTS[provider]) {
      if (provider === "gemini") {
        endpoint = `${HOSTED_ENDPOINTS.gemini}/v1beta/models/${model}:generateContent?key=${apiKey}`;
      } else {
        endpoint = HOSTED_ENDPOINTS[provider];
      }
    } else {
      return NextResponse.json({ error: "Unsupported AI provider" }, { status: 400 });
    }

    let resultText = "";

    const openAICompatible = ["openai", "deepseek", "openrouter", "lmstudio", "mistral", "groq", "perplexity"];
    if (openAICompatible.includes(provider)) {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (provider !== "lmstudio") {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        redirect: "error", // Prevent 3xx redirect SSRF bypasses
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
        }),
      });

      if (!res.ok) {
        throw new Error("Provider request failed");
      }

      const data = await res.json();
      resultText = data.choices[0].message.content;
    } else if (provider === "anthropic") {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        redirect: "error",
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          system: systemPrompt,
          messages: [
            { role: "user", content: userPrompt }
          ]
        })
      });

      if (!res.ok) {
        throw new Error("Provider request failed");
      }

      const data = await res.json();
      resultText = data.content[0].text;
    } else if (provider === "gemini") {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        redirect: "error",
        body: JSON.stringify({
          system_instruction: {
            parts: { text: systemPrompt }
          },
          contents: [
            {
              role: "user",
              parts: [{ text: userPrompt }]
            }
          ]
        })
      });

      if (!res.ok) {
        throw new Error("Provider request failed");
      }

      const data = await res.json();
      resultText = data.candidates[0].content.parts[0].text;
    } else if (provider === "ollama") {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        redirect: "error",
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          stream: false
        })
      });

      if (!res.ok) {
        throw new Error("Provider request failed");
      }

      const data = await res.json();
      resultText = data.message.content;
    } else if (provider === "cohere") {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        redirect: "error",
        body: JSON.stringify({
          model,
          message: userPrompt,
          preamble: systemPrompt
        })
      });

      if (!res.ok) {
        throw new Error("Provider request failed");
      }

      const data = await res.json();
      resultText = data.text;
    }

    if (mode === "personalize") {
      try {
        const cleaned = resultText.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
        const match = cleaned.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(match ? match[0] : cleaned);
        const card = {
          title: typeof parsed.title === "string" ? parsed.title.slice(0, 200) : undefined,
          subtitle: typeof parsed.subtitle === "string" ? parsed.subtitle.slice(0, 400) : undefined,
          body: typeof parsed.body === "string" ? parsed.body.slice(0, 2000) : undefined,
        };
        if (!card.title && !card.body) throw new Error("no usable fields");
        return NextResponse.json({ text: resultText, card });
      } catch {
        return NextResponse.json(
          { error: "The AI didn't return valid card JSON — try again or a different model.", text: resultText },
          { status: 422 },
        );
      }
    }

    return NextResponse.json({ text: resultText });
  } catch (err: unknown) {
    console.error("AI Generation Endpoint Error:", providerName);
    return NextResponse.json({ error: sanitizeErrorMessage() }, { status: 500 });
  }
}
