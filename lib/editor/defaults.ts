import { Theme, CardConfig } from "../themes/types";

export function getDefaultConfig(theme: Theme): CardConfig {
  return {
    title: theme.content.title,
    subtitle: theme.content.subtitle || "",
    body: theme.content.body || "",
    recipient: "",
    sender: "",
    palette: { ...theme.visual.palette },
    fontHeading: theme.visual.fonts.heading,
    fontBody: theme.visual.fonts.body,
    animationSpeed: "normal",
    animationsEnabled: true,
    ctaYesText: theme.content.cta?.yesText || "",
    ctaNoText: theme.content.cta?.noText || "",
    deliveryStyle: theme.delivery.defaultStyle,
    audioPreset: theme.audio.defaultPreset,
    audioVolume: theme.audio.volume,
    audioAutoplay: theme.audio.autoplay,
    countdownTarget: theme.content.countdownTarget || "",
    stickers: [],
    experience: theme.experienceDefaults
      ? JSON.parse(JSON.stringify(theme.experienceDefaults))
      : undefined,
    isCollaborative:
      theme.experienceId === "live-canvas" ||
      theme.experienceId === "wish-jar" ||
      theme.experienceId === "reaction-wall",
    maxContributors: 20,
    collabPassword: "",
    scheduledAt: "",
    password: "",
    hasRsvp: false,
    surpriseMode: false,
    emotionalTone: 50,
    dynamicTime: false,
  };
}
