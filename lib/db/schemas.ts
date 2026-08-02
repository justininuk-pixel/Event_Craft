import { z } from "zod";

// Theme Palette Validation
export const ThemePaletteSchema = z.object({
  primary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid primary hex color"),
  secondary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid secondary hex color"),
  accent: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid accent hex color"),
  background: z.union([z.string(), z.array(z.string())]),
  text: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid text hex color"),
  textSecondary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid secondary text hex color"),
});

// Sticker Placement Validation.
// .passthrough() keeps the advanced optional props (scaleX/scaleY, flipX/flipY,
// color, groupId, isLocked, props) so published cards don't lose sticker fidelity.
export const StickerPlacementSchema = z
  .object({
    stickerId: z.string(),
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
    rotation: z.number().min(-360).max(360),
    scale: z.number().min(0.5).max(3.0),
  })
  .passthrough();

// Experience (mini-app) structured content, persisted inside config JSONB.
const TimelineMilestoneSchema = z.object({
  id: z.string(),
  date: z.string().max(60).optional(),
  title: z.string().max(120),
  body: z.string().max(600),
  mediaUrl: z.string().optional(),
  emoji: z.string().max(8).optional(),
});

const MessageLayerSchema = z.object({
  id: z.string(),
  label: z.string().max(120),
  body: z.string().max(600),
  emoji: z.string().max(8).optional(),
});

const StoryPageSchema = z.object({
  id: z.string(),
  title: z.string().max(120).optional(),
  body: z.string().max(600),
  mediaUrl: z.string().optional(),
});

export const ExperienceConfigSchema = z.object({
  milestones: z.array(TimelineMilestoneSchema).max(40).optional(),
  layers: z.array(MessageLayerSchema).max(20).optional(),
  unlockDate: z.string().max(60).optional(),
  teaser: z.string().max(400).optional(),
  puzzlePrompt: z.string().max(120).optional(),
  puzzleAnswer: z.string().max(40).optional(),
  puzzleHint: z.string().max(120).optional(),
  gesture: z.enum(["flip-off", "high-five", "hug", "applause", "fist-bump", "blow-kiss"]).optional(),
  gesturePrompt: z.string().max(120).optional(),
  pages: z.array(StoryPageSchema).max(40).optional(),
  scratchHint: z.string().max(60).optional(),
  wrapLayers: z.number().int().min(1).max(6).optional(),
  balloonCount: z.number().int().min(3).max(12).optional(),
  questions: z
    .array(
      z.object({
        id: z.string(),
        q: z.string().max(200),
        options: z.array(z.string().max(120)).max(4),
        answer: z.number().int().min(0).max(3),
      })
    )
    .max(12)
    .optional(),
  matchPairs: z.number().int().min(3).max(8).optional(),
  growStages: z.array(z.string().max(8)).max(8).optional(),
  // generic timer / score tunables (delayed-gratification wait, snake apples, etc.)
  waitSeconds: z.number().int().min(5).max(3600).optional(),
  targetScore: z.number().int().min(1).max(100).optional(),
})
  // Experiences read many bespoke knobs from config.experience (artifacts, chat messages,
  // breathing rhythm, locations, items...). Passthrough keeps them from being silently
  // stripped at publish, the historic cause of "my settings don't show in the link".
  .passthrough();

// Card Config Validation
export const CardConfigSchema = z.object({
  title: z.string().max(200, "Title is too long"),
  subtitle: z.string().max(200, "Subtitle is too long").optional(),
  body: z.string().max(2000, "Body message is too long").optional(),
  recipient: z.string().min(1, "Recipient name is required").max(100),
  sender: z.string().min(1, "Sender name is required").max(100),
  palette: ThemePaletteSchema,
  fontHeading: z.string(),
  fontBody: z.string(),
  animationSpeed: z.enum(["slow", "normal", "fast"]),
  animationsEnabled: z.boolean(),
  mediaUrl: z.string().url("Invalid media URL").optional().or(z.literal("")),
  mediaUrls: z.array(z.string().url("Invalid media URL")).optional(),
  voiceUrl: z.string().url("Invalid voice URL").optional().or(z.literal("")),
  handwritingData: z.string().optional(), // Base64 signature
  ctaYesText: z.string().max(50).optional(),
  ctaNoText: z.string().max(50).optional(),
  deliveryStyle: z.string(),
  audioPreset: z.string(),
  audioVolume: z.number().min(0.0).max(1.0),
  audioAutoplay: z.boolean(),
  countdownTarget: z.string().optional().or(z.literal("")),
  stickers: z.array(StickerPlacementSchema).default([]),
  experience: ExperienceConfigSchema.optional(),
  surpriseMode: z.boolean().optional(),
  emotionalTone: z.number().min(0).max(100).optional(),
  dynamicTime: z.boolean().optional(),
});

// Create Card Request Validation
export const CreateCardSchema = z.object({
  themeId: z.string().min(1, "Theme ID is required"),
  config: CardConfigSchema,
  deliveryStyle: z.string().default("envelope"),
  audioPreset: z.string().default("none"),
  isCollaborative: z.boolean().default(false),
  maxContributors: z.number().int().min(1).max(100).nullable().default(10),
  collabPassword: z.string().max(100).optional().nullable(),
  scheduledAt: z.string().nullable().optional(),
  password: z.string().min(4, "Password must be at least 4 characters").max(100).optional().nullable(),
  hasRsvp: z.boolean().default(false),
});

// Reaction Request Validation
export const ReactionSchema = z.object({
  emoji: z.string().min(1, "Emoji is required"),
  message: z.string().max(500, "Message is too long").optional().nullable(),
  displayName: z.string().max(50, "Name is too long").optional().nullable(),
});

// Group Card Contribution Validation
export const ContributionSchema = z.object({
  displayName: z.string().min(1, "Name is required").max(50, "Name is too long"),
  message: z.string().min(1, "Message is required").max(1000, "Message is too long"),
  signature: z.string().optional().nullable(), // base64 drawing
  photoUrl: z.string().url("Invalid photo URL").optional().nullable().or(z.literal("")),
  voiceUrl: z.string().url("Invalid voice URL").optional().nullable().or(z.literal("")),
});

// RSVP Request Validation
export const RSVPSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  response: z.enum(["yes", "no", "maybe"]),
  guestCount: z.number().int().min(1).max(50).default(1),
  note: z.string().max(500, "Note is too long").optional().nullable(),
});

// File Upload validations
export const PhotoUploadSchema = z.object({
  size: z.number().max(5 * 1024 * 1024, "Max photo size is 5MB"),
  type: z.string().regex(/^image\/(jpeg|png|webp|gif)$/, "Only JPEG, PNG, WEBP, and GIF images are allowed"),
});

export const VoiceUploadSchema = z.object({
  size: z.number().max(2 * 1024 * 1024, "Max voice memo size is 2MB"),
  type: z.string().regex(/^audio\/(webm|mp3|wav|ogg|mpeg|m4a|aac)$/, "Invalid audio format"),
});
