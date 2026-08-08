import React from "react";
import { notFound } from "next/navigation";
import { getCard, toPublicCard, toLockedCard } from "@/lib/db/cards";
import { getThemeById } from "@/lib/themes/registry";
import { getContributions } from "@/lib/db/contributions";
import { ViewerLayout } from "@/components/viewer/ViewerLayout";
import { fillTemplate } from "@/lib/utils/templates";
import { Contribution } from "@/lib/themes/types";

interface CardPageProps {
  params: Promise<{ cardId: string }>;
}

export async function generateMetadata({ params }: CardPageProps) {
  const { cardId } = await params;
  
  try {
    const card = await getCard(cardId);
    if (!card) return { title: "Card Not Found | CelebrationCraft" };

    const theme = getThemeById(card.theme_id);
    if (!theme) return { title: "Card Preview | CelebrationCraft" };

    // Never put a protected card's recipient/sender/title into metadata or its OG image,
    // those tags are public and would defeat the passcode.
    if (card.password_hash) {
      return {
        title: "Private Greeting Card | CelebrationCraft",
        description: "This card is passcode protected. Enter the passcode to open it.",
        robots: { index: false, follow: false },
      };
    }

    const titleTemplate = theme.seo.ogTitle || "A special greeting for {recipient}";
    const descTemplate = theme.seo.ogDescription || "Open this interactive card from {sender} to read their message.";

    const title = fillTemplate(titleTemplate, card.config);
    const description = fillTemplate(descTemplate, card.config);

    // Dynamic Satori OG Image URL
    const ogImageUrl = `/api/og/${cardId}`;

    return {
      title: `${title} | CelebrationCraft`,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: ogImageUrl, width: 1200, height: 630 }],
      },
    };
  } catch {
    return { title: "Greeting Card | CelebrationCraft" };
  }
}

export default async function CardPage({ params }: CardPageProps) {
  const { cardId } = await params;

  let card;
  try {
    card = await getCard(cardId);
  } catch (err) {
    console.error("Error loading card", err);
    return notFound();
  }

  if (!card) {
    return notFound();
  }

  const theme = getThemeById(card.theme_id);
  if (!theme) {
    return notFound();
  }

  const isLocked = !!card.password_hash;

  // Fetch initial group wishes if collaborative. Skipped for locked cards, contributions are
  // card content and must not ship to a viewer who hasn't entered the passcode.
  let initialContributions: Contribution[] = [];
  if (card.is_collaborative && !isLocked) {
    try {
      initialContributions = await getContributions(cardId);
    } catch (err) {
      console.error("Error loading group wishes", err);
    }
  }

  // A passcode-protected card ships as a content-free stub. The real config is served by
  // /api/cards/[cardId]/verify-password only after the passcode is verified, otherwise the
  // "gate" is purely cosmetic and anyone can read the card straight out of the RSC payload.
  const cardForClient = isLocked ? toLockedCard(card) : toPublicCard(card);

  return (
    <ViewerLayout
      card={cardForClient}
      theme={theme}
      initialContributions={initialContributions}
    />
  );
}
