"use client";

import React from "react";
import dynamic from "next/dynamic";
import { DeliveryStyle, ThemePalette } from "@/lib/themes/types";

const EnvelopeDelivery = dynamic(() => import("../themes/delivery/EnvelopeDelivery").then((mod) => mod.EnvelopeDelivery), { ssr: false });
const ScrollDelivery = dynamic(() => import("../themes/delivery/ScrollDelivery").then((mod) => mod.ScrollDelivery), { ssr: false });
const GiftBoxDelivery = dynamic(() => import("../themes/delivery/GiftBoxDelivery").then((mod) => mod.GiftBoxDelivery), { ssr: false });
const LetterDelivery = dynamic(() => import("../themes/delivery/LetterDelivery").then((mod) => mod.LetterDelivery), { ssr: false });
const BookDelivery = dynamic(() => import("../themes/delivery/BookDelivery").then((mod) => mod.BookDelivery), { ssr: false });
const PaperAirplaneDelivery = dynamic(() => import("../themes/delivery/PaperAirplaneDelivery").then((mod) => mod.PaperAirplaneDelivery), { ssr: false });
const BottleDelivery = dynamic(() => import("../themes/delivery/BottleDelivery").then((mod) => mod.BottleDelivery), { ssr: false });
const TelegramDelivery = dynamic(() => import("../themes/delivery/TelegramDelivery").then((mod) => mod.TelegramDelivery), { ssr: false });
const HologramDelivery = dynamic(() => import("../themes/delivery/HologramDelivery").then((mod) => mod.HologramDelivery), { ssr: false });
const PortalDelivery = dynamic(() => import("../themes/delivery/PortalDelivery").then((mod) => mod.PortalDelivery), { ssr: false });
const PolaroidDelivery = dynamic(() => import("../themes/delivery/PolaroidDelivery").then((mod) => mod.PolaroidDelivery), { ssr: false });
const NoneDelivery = dynamic(() => import("../themes/delivery/NoneDelivery").then((mod) => mod.NoneDelivery), { ssr: false });

export interface DeliveryRendererProps {
  style: DeliveryStyle;
  palette: ThemePalette;
  onComplete: () => void;
}

/** Single source of truth for mapping a delivery style to its animation component. */
export function DeliveryRenderer({ style, palette, onComplete }: DeliveryRendererProps) {
  const props = { onComplete, palette };
  switch (style) {
    case "envelope":
      return <EnvelopeDelivery {...props} />;
    case "scroll":
      return <ScrollDelivery {...props} />;
    case "gift-box":
      return <GiftBoxDelivery {...props} />;
    case "letter":
      return <LetterDelivery {...props} />;
    case "book":
      return <BookDelivery {...props} />;
    case "paper-airplane":
      return <PaperAirplaneDelivery {...props} />;
    case "bottle":
      return <BottleDelivery {...props} />;
    case "telegram":
      return <TelegramDelivery {...props} />;
    case "hologram":
      return <HologramDelivery {...props} />;
    case "portal":
      return <PortalDelivery {...props} />;
    case "polaroid":
      return <PolaroidDelivery {...props} />;
    default:
      return <NoneDelivery {...props} />;
  }
}

export default DeliveryRenderer;
