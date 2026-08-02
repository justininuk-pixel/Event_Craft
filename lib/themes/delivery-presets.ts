import { DeliveryStyle } from "./types";

export interface DeliveryStyleMetadata {
  id: DeliveryStyle;
  name: string;
  description: string;
  duration: number; // in ms
  sfxPath?: string;
}

export const DELIVERY_PRESETS: Record<DeliveryStyle, DeliveryStyleMetadata> = {
  envelope: {
    id: "envelope",
    name: "Classic 3D Envelope",
    description: "A beautiful 3D envelope opens and the card slides out smoothly.",
    duration: 2500,
    sfxPath: "/sfx/envelope-open.mp3",
  },
  scroll: {
    id: "scroll",
    name: "Ancient Scroll",
    description: "A royal parchment scroll unfurls vertically, revealing the message.",
    duration: 3000,
    sfxPath: "/sfx/paper-unfold.mp3",
  },
  "gift-box": {
    id: "gift-box",
    name: "Surprise Gift Box",
    description: "A gift box shakes and pops open, releasing balloons and confetti.",
    duration: 3500,
    sfxPath: "/sfx/gift-unwrap.mp3",
  },
  letter: {
    id: "letter",
    name: "Mailbox Delivery",
    description: "A letter slides out of a classic mailbox flag-up delivery.",
    duration: 3000,
    sfxPath: "/sfx/paper-unfold.mp3",
  },
  book: {
    id: "book",
    name: "Magic Storybook",
    description: "A leather-bound book opens, turning pages to reveal the card.",
    duration: 4000,
    sfxPath: "/sfx/paper-unfold.mp3",
  },
  "paper-airplane": {
    id: "paper-airplane",
    name: "Paper Airplane",
    description: "An airplane swoops in across the screen and unfolds into a card.",
    duration: 2500,
    sfxPath: "/sfx/whoosh.mp3",
  },
  bottle: {
    id: "bottle",
    name: "Message in a Bottle",
    description: "Washes ashore on waves, the cork pops, and the scroll floats up.",
    duration: 4000,
    sfxPath: "/sfx/cork-pop.mp3",
  },
  telegram: {
    id: "telegram",
    name: "Retro Telegram",
    description: "Typewriter feeds ticker tape in a vintage telegram style.",
    duration: 3500,
    sfxPath: "/sfx/typewriter-key.mp3",
  },
  hologram: {
    id: "hologram",
    name: "Sci-Fi Hologram",
    description: "Cyberpunk scanlines pulse as the card materializes out of light.",
    duration: 2500,
    sfxPath: "/sfx/magic-sparkle.mp3",
  },
  portal: {
    id: "portal",
    name: "Magic Portal",
    description: "A swirling vortex opens and the card emerges from another dimension.",
    duration: 3000,
    sfxPath: "/sfx/magic-sparkle.mp3",
  },
  polaroid: {
    id: "polaroid",
    name: "Instant Polaroid",
    description: "A polaroid photo slides in and slowly develops from blank white.",
    duration: 3000,
    sfxPath: "/sfx/camera-shutter.mp3",
  },
  none: {
    id: "none",
    name: "Instant Reveal",
    description: "Reveals the card immediately with a simple fade-in.",
    duration: 300,
  },
};
