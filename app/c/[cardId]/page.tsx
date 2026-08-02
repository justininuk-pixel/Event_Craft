import React from "react";
import { notFound } from "next/navigation";
import { getCard } from "@/lib/db/cards";
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

  // Fetch initial group wishes if collaborative
  let initialContributions: Contribution[] = [];
  if (card.is_collaborative) {
    try {
      initialContributions = await getContributions(cardId);
    } catch (err) {
      console.error("Error loading group wishes", err);
    }
  }

  const sanitizedCard = {
    ...card,
    password_hash: card.password_hash ? "protected" : null,
    collab_password: card.collab_password ? "protected" : null,
  };

  return (
    <ViewerLayout
      card={sanitizedCard}
      theme={theme}
      initialContributions={initialContributions}
    />
  );
}
