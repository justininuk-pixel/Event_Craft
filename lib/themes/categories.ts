import { ThemeCategory } from "./types";

export interface CategoryMetadata {
  label: string;
  emoji: string;
  color: string; // hex
  description: string;
}

export const CATEGORIES: Record<ThemeCategory, CategoryMetadata> = {
  romance: {
    label: "Romance",
    emoji: "❤️",
    color: "#ec4899",
    description: "Express your love, romantic thoughts, and anniversary wishes.",
  },
  proposal: {
    label: "Proposal",
    emoji: "💍",
    color: "#db2777",
    description: "Unforgettable, interactive ways to pop the big question.",
  },
  birthday: {
    label: "Birthday",
    emoji: "🎂",
    color: "#f59e0b",
    description: "Milestones, zodiac signs, and custom birthday celebrations.",
  },
  achievement: {
    label: "Achievement",
    emoji: "🏆",
    color: "#eab308",
    description: "Graduations, promotions, and significant accomplishments.",
  },
  family: {
    label: "Family",
    emoji: "🏠",
    color: "#6366f1",
    description: "Father's Day, Mother's Day, and family celebrations.",
  },
  friendship: {
    label: "Friendship",
    emoji: "🤝",
    color: "#14b8a6",
    description: "Celebrate close friends and cherish memories together.",
  },
  "thank-you": {
    label: "Thank You",
    emoji: "🙏",
    color: "#10b981",
    description: "Show your appreciation with elegant expressions of gratitude.",
  },
  apology: {
    label: "Apology",
    emoji: "😔",
    color: "#6b7280",
    description: "Sincere, heartfelt ways to say you are sorry.",
  },
  "get-well": {
    label: "Get Well",
    emoji: "🩹",
    color: "#3b82f6",
    description: "Send wishes for a speedy recovery and comfort.",
  },
  invitation: {
    label: "Invitation",
    emoji: "✉️",
    color: "#8b5cf6",
    description: "Elegant and interactive digital invites with built-in RSVPs.",
  },
  "cultural-asian": {
    label: "Asian Culture",
    emoji: "🏮",
    color: "#ef4444",
    description: "Lunar New Year, Hanami, Mid-Autumn Festival, and more.",
  },
  "cultural-african": {
    label: "African Culture",
    emoji: "🌍",
    color: "#15803d",
    description: "Eid al-Fitr, Kwanzaa, and diverse African celebrations.",
  },
  "cultural-western": {
    label: "Western Culture",
    emoji: "🎄",
    color: "#059669",
    description: "Christmas, Halloween, Thanksgiving, and New Year countdowns.",
  },
  "cultural-latin": {
    label: "Latin Culture",
    emoji: "💃",
    color: "#ea580c",
    description: "Dia de los Muertos, Cinco de Mayo, and Latin festivals.",
  },
  "cultural-middle-eastern": {
    label: "Middle Eastern Culture",
    emoji: "🕌",
    color: "#b45309",
    description: "Eid, Ramadan, Nowruz, and other Middle Eastern traditions.",
  },
  "cultural-south-asian": {
    label: "South Asian Culture",
    emoji: "🪔",
    color: "#d97706",
    description: "Diwali, Holi, Eid, and vibrant South Asian traditions.",
  },
  "cultural-oceanian": {
    label: "Oceanian Culture",
    emoji: "🌊",
    color: "#0284c7",
    description: "Matariki, Pasifika, and Oceanian custom celebrations.",
  },
  awareness: {
    label: "Awareness & Pride",
    emoji: "🌈",
    color: "#a855f7",
    description: "Support Pride, mental health, and social awareness movements.",
  },
  memorial: {
    label: "Memorial",
    emoji: "🕯️",
    color: "#4b5563",
    description: "Dignified, respectful tributes to remember loved ones.",
  },
  sympathy: {
    label: "Sympathy",
    emoji: "🤍",
    color: "#9ca3af",
    description: "Express condolences and send comfort during hard times.",
  },
  wellness: {
    label: "Wellness",
    emoji: "🧘",
    color: "#0d9488",
    description: "Self-care reminders, mindfulness, and peaceful wishes.",
  },
  wedding: {
    label: "Wedding",
    emoji: "💒",
    color: "#f472b6",
    description: "Desi, Chinese, Classic Western, and modern wedding cards.",
  },
  funny: {
    label: "Funny & Interactive",
    emoji: "🤪",
    color: "#f43f5e",
    description:
      "Cards with evading buttons, dvd bouncing, and loop-of-doom rejectors.",
  },
  seasonal: {
    label: "Seasonal",
    emoji: "🍂",
    color: "#c2410c",
    description: "Celebrate Spring, Summer, Autumn, and Winter changes.",
  },
  sports: {
    label: "Sports",
    emoji: "⚽",
    color: "#2563eb",
    description: "Game day invitations, team milestones, and sports victories.",
  },
  "life-event": {
    label: "Life Event",
    emoji: "🍼",
    color: "#db2777",
    description: "Retirements, housewarmings, graduations, and baby arrivals.",
  },
  professional: {
    label: "Professional",
    emoji: "💼",
    color: "#0f172a",
    description:
      "Product launches, job shipping, promotions, and work anniversaries.",
  },
  "food-drink": {
    label: "Food & Drink",
    emoji: "🍳",
    color: "#ea580c",
    description: "Dinner invites, cocktail hours, cooking sessions, and food gifts.",
  },
  travel: {
    label: "Travel",
    emoji: "✈️",
    color: "#06b6d4",
    description: "Bon voyage cards, flight countdowns, and travel journals.",
  },
  pet: {
    label: "Pet",
    emoji: "🐾",
    color: "#d97706",
    description: "Pet birthdays, adoption anniversaries, and pet loss sympathy.",
  },
  baby: {
    label: "Baby",
    emoji: "👶",
    color: "#ec4899",
    description: "Baby showers, gender reveals, and welcoming newborn infants.",
  },
  religious: {
    label: "Religious",
    emoji: "✨",
    color: "#fbbf24",
    description: "Faith-based celebrations, prayers, and sacred observances.",
  },
  countdown: {
    label: "Countdown",
    emoji: "⏳",
    color: "#ef4444",
    description: "Count down the days, hours, and minutes to special dates.",
  },
};
