// lib/themes/types.ts

// ===================== ENUMS & UNIONS =====================

export type ThemeCategory =
  | 'romance'
  | 'proposal'
  | 'birthday'
  | 'achievement'
  | 'family'
  | 'friendship'
  | 'thank-you'
  | 'apology'
  | 'get-well'
  | 'invitation'
  | 'cultural-asian'
  | 'cultural-african'
  | 'cultural-western'
  | 'cultural-latin'
  | 'cultural-middle-eastern'
  | 'cultural-south-asian'
  | 'cultural-oceanian'
  | 'awareness'
  | 'memorial'
  | 'sympathy'
  | 'wellness'
  | 'wedding'
  | 'funny'
  | 'seasonal'
  | 'sports'
  | 'life-event'
  | 'professional'
  | 'food-drink'
  | 'travel'
  | 'pet'
  | 'baby'
  | 'religious'
  | 'countdown';

export type ThemeMood =
  | 'celebratory'
  | 'romantic'
  | 'solemn'
  | 'funny'
  | 'inspirational'
  | 'nostalgic'
  | 'peaceful'
  | 'energetic'
  | 'mysterious'
  | 'cute';

export type AnimationEngineId =
  | 'particles'
  | 'fireworks'
  | 'confetti'
  | 'physics'
  | 'typewriter'
  | 'morph-svg'
  | 'mesh-gradient'
  | 'glitch'
  | 'parallax'
  | 'bloom'
  | 'canvas-custom'
  | 'scratch-reveal'
  | 'flip-card-3d'
  | 'pop-up-card'
  | 'snow'
  | 'rain'
  | 'audio-visualiser'
  | 'countdown-timer'
  | 'css-only'
  | 'none';

export type DeliveryStyle =
  | 'envelope'         // 3D CSS envelope opens, card slides out
  | 'scroll'           // Parchment scroll unfurls vertically
  | 'gift-box'         // Gift box lid lifts, card rises out with particles
  | 'letter'           // Letter slides out of mailbox
  | 'book'             // Book cover opens, pages flip to card
  | 'paper-airplane'   // Paper airplane flies in, unfolds into card
  | 'bottle'           // Message in a bottle washes ashore, uncorks
  | 'telegram'         // Telegram/ticker tape feeds in character by character
  | 'hologram'         // Sci-fi hologram materialises with scan lines
  | 'portal'           // Magic portal opens, card emerges from another dimension
  | 'polaroid'         // Polaroid photo develops from white
  | 'none';            // Instant reveal

export type AudioPresetId =
  | 'romantic-piano'
  | 'upbeat-celebration'
  | 'gentle-acoustic'
  | 'epic-orchestral'
  | 'lofi-chill'
  | 'jazz-smooth'
  | 'ambient-nature'
  | 'retro-synthwave'
  | 'traditional-chinese'
  | 'bollywood-festive'
  | 'african-drums'
  | 'celtic-harp'
  | 'japanese-koto'
  | 'arabic-oud'
  | 'latin-guitar'
  | 'solemn-strings'
  | 'music-box'
  | 'chiptune-8bit'
  | 'cinematic-tension'
  | 'none';

export type InteractiveType =
  | 'evading-button'
  | 'physics-fan'
  | 'bouncing-dvd'
  | 'shrinking-no'
  | 'ninja-teleport'
  | 'loop-of-doom'
  | 'swap-on-touch'
  | 'gravity-well'
  | 'scratch-reveal'
  | 'puzzle-pieces'
  | 'slot-machine'
  | 'magic-8-ball'
  | 'spin-the-wheel'
  | 'password-cracker';

export type MobileInteractiveStrategy =
  | 'instant-swap'
  | 'gyroscope-slide'
  | 'shrinking-target'
  | 'bouncing-dvd'
  | 'are-you-sure-loop'
  | 'ninja-teleport'
  | 'accelerometer-physics'
  | 'gravity-well'
  | 'scratch-reveal'
  | 'puzzle-pieces'
  | 'slot-machine'
  | 'magic-8-ball'
  | 'spin-the-wheel'
  | 'password-cracker';

// ===================== INTERFACES =====================

export interface ThemePalette {
  primary: string;        // hex
  secondary: string;      // hex
  accent: string;         // hex
  background: string | string[];  // single hex OR array of gradient stops
  text: string;           // hex
  textSecondary: string;  // hex
}

export interface ThemeFonts {
  heading: string;    // Google Font name exactly as in @fontsource
  body: string;
  accent?: string;    // Optional third font for decorative elements
}

export interface ThemeVisual {
  palette: ThemePalette;
  backgroundType: 'solid' | 'gradient' | 'mesh-gradient' | 'animated-gradient' | 'pattern' | 'canvas-driven' | 'video-loop' | 'parallax-layers';
  backgroundConfig?: Record<string, unknown>;
  fonts: ThemeFonts;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  layout: 'centered' | 'split' | 'fullscreen' | 'card-on-bg' | 'scroll-reveal' | 'multi-page' | 'magazine' | 'polaroid' | 'postcard';
  animationEngine: AnimationEngineId;
  animationConfig: Record<string, unknown>;
}

export interface ThemeContent {
  title: string;             // Default title, must be real, appropriate text. Never "Your Title Here"
  subtitle?: string;
  body?: string;             // Default body text, real, sendable message
  recipientLabel: string;    // Placeholder text, e.g. "their name"
  senderLabel: string;       // Placeholder text, e.g. "your name"
  cta?: {                    // Only for interactive/funny themes
    yesText: string;
    noText: string;
    promptText: string;
  };
  supportsMedia: boolean;    // Whether theme has a photo placeholder
  supportsVoice: boolean;    // Whether theme allows voice memo attachment
  supportsHandwriting: boolean;  // Whether theme shows handwriting area
  supportsCollage: boolean;  // Whether theme supports multi-photo layout
  countdownTarget?: string;  // ISO date string for countdown themes (user can override)
}

export interface ThemeAudio {
  defaultPreset: AudioPresetId;           // Default background music
  sfxOnReveal?: string;                   // Sound effect file path played on card reveal
  sfxOnInteraction?: string;              // Sound effect for interactive elements
  sfxOnCelebration?: string;              // Sound effect when "Yes" is clicked
  volume: number;                         // Default volume 0.0–1.0
  autoplay: boolean;                      // Whether audio starts automatically
  loop: boolean;                          // Whether background music loops
}

export interface ThemeDelivery {
  defaultStyle: DeliveryStyle;            // Default delivery animation
  allowedStyles: DeliveryStyle[];         // Which delivery styles this theme supports
  deliveryDuration: number;               // Duration in ms before card is fully revealed
  sfx?: string;                           // Sound effect for delivery animation
}

export interface MobileInteractiveBehavior {
  strategy: MobileInteractiveStrategy;
  permissionRequired?: boolean;            // true for gyroscope/accelerometer
  permissionPromptText?: string;           // Shown before requesting device permission
  fallbackStrategy: MobileInteractiveStrategy;  // Used if permission denied
  config: Record<string, unknown>;
}

export interface ThemeInteractive {
  type: InteractiveType;
  desktopConfig: Record<string, unknown>;
  mobile: MobileInteractiveBehavior;
}

export interface ThemeEditable {
  title: boolean;
  subtitle: boolean;
  body: boolean;
  recipient: boolean;
  sender: boolean;
  palette: boolean;
  fonts: boolean;
  animationSpeed: boolean;
  media: boolean;
  voice: boolean;
  handwriting: boolean;
  ctaText: boolean;               // Can Yes/No button text be renamed
  deliveryStyle: boolean;         // Can delivery animation be changed
  audioPreset: boolean;           // Can background music be changed
  countdownTarget: boolean;       // Can countdown date be changed
  stickers: boolean;              // Can stickers be added
}

// ===================== EXPERIENCE ENGINE =====================
//
// A theme can be a unique "experience", a mini-app with its own STRUCTURE,
// INTERACTION, PURPOSE, FLOW and INPUT TYPE, rendered by a dedicated component
// instead of the metadata-driven ThemeRenderer. This is the layer that lets a
// theme differ in *what it does*, not merely in fonts/colours/animation.
// Style (palette, fonts, background, animation) still layers on top and stays
// fully editor-controlled, keeping STYLE cleanly separated from STRUCTURE.

export type ExperienceId =
  | 'memory-timeline'   // Scrollable archive of memories; tap a moment to unlock its message
  | 'unlock-layers'     // Peel nested layers, each revealing a deeper message
  | 'future-message'    // Sealed until a chosen date; countdown + anticipation UX
  | 'puzzle-reveal'     // Solve a small puzzle to unlock the message
  | 'reaction-gesture'  // Tap to make an animated hand perform a gesture (🖕, high-five, hug…)
  | 'story-mode'        // Multi-page book/narrative the recipient pages through
  | 'scratch-message'   // Scratch off a coating to reveal the message
  | 'gift-unwrap'       // Tap to tear away wrapping layers, then the gift opens
  | 'balloon-pop'       // Pop balloons to celebrate, then the message reveals
  | 'quiz-reveal'       // Answer questions ("how well do you know me") → score + reveal
  | 'memory-match'      // Flip-card matching game; clear the board to reveal
  | 'tap-to-grow'       // Tap to grow something from seed to bloom, then reveal
  | 'live-canvas'       // Shared board everyone draws/signs on together
  | 'wish-jar'          // Contributors drop wishes into a shared jar; tap to read
  | 'reaction-wall'     // A shared wall of everyone's notes + emoji stamps
  | (string & {});      // Allows any string (e.g. 500 new plan themes) while keeping autocomplete

// Animated gestures for the reaction-gesture experience.
export type GestureType =
  | 'flip-off'    // 🖕 the petty / "for someone who deserves it" card
  | 'high-five'   // 🙌 celebration / congrats
  | 'hug'         // 🤗 comfort / miss you
  | 'applause'    // 👏 achievement
  | 'fist-bump'   // 👊 friendship / solidarity
  | 'blow-kiss';  // 😘 romance

export type ExperienceFlow =
  | 'linear'
  | 'branching'
  | 'game-like'
  | 'non-linear'
  | 'time-gated';

export type ExperienceInput =
  | 'text'
  | 'photo'
  | 'voice'
  | 'video'
  | 'collaborative'
  | 'draw';

// The "what can this theme DO that others cannot?" metadata.
export interface ExperienceMechanic {
  structure: string;     // How content is organised (timeline vs single card vs layers…)
  interaction: string;   // What the recipient physically does
  purpose: string;       // The emotional/functional job it performs
  flow: ExperienceFlow;
  inputType: ExperienceInput[];
  summary: string;       // One-line "unique mechanic" pitch
}

// ---- Structured, experience-specific content ----
// Each experience reads only the fields it needs.

export interface TimelineMilestone {
  id: string;
  date?: string;     // Freeform ("Summer 2019") or ISO
  title: string;
  body: string;
  mediaUrl?: string;
  emoji?: string;
}

export interface MessageLayer {
  id: string;
  label: string;     // Teaser shown on the sealed layer
  body: string;      // Message revealed when peeled
  emoji?: string;
}

export interface StoryPage {
  id: string;
  title?: string;
  body: string;
  mediaUrl?: string;
}

export interface QuizQuestion {
  id: string;
  q: string;
  options: string[];   // 2–4 answer choices
  answer: number;      // index of the correct option
}

export interface ExperienceConfig {
  // memory-timeline
  milestones?: TimelineMilestone[];
  // unlock-layers
  layers?: MessageLayer[];
  // future-message
  unlockDate?: string;   // ISO date string
  teaser?: string;       // Shown while sealed
  // puzzle-reveal
  puzzlePrompt?: string;
  puzzleAnswer?: string;
  puzzleHint?: string;
  // reaction-gesture
  gesture?: GestureType;
  gesturePrompt?: string;   // shown before they tap (e.g. "Tap to send your reply")
  // story-mode
  pages?: StoryPage[];
  // scratch-message
  scratchHint?: string;     // overlay prompt, e.g. "Scratch here!"
  // gift-unwrap
  wrapLayers?: number;      // how many taps to unwrap (1–6)
  // balloon-pop
  balloonCount?: number;    // how many balloons to pop (3–12)
  // quiz-reveal
  questions?: QuizQuestion[];
  // memory-match
  matchPairs?: number;      // how many pairs to clear (3–8)
  // tap-to-grow
  growStages?: string[];    // emoji stages from seed → bloom
  // generic timer-based experiences (e.g. delayed-gratification patience test)
  waitSeconds?: number;     // how long the recipient must wait / stay focused
  // generic score-based games (e.g. snake apples to eat)
  targetScore?: number;     // points needed to win / reveal
}

export interface Theme {
  id: string;                     // kebab-case, globally unique, e.g. "proposal-rose-garden"
  name: string;                   // Display name, e.g. "Rose Garden Proposal"
  description: string;            // 1-2 sentences describing the vibe and ideal use case
  emoji: string;                  // Single emoji
  category: ThemeCategory;
  subcategory: string;            // Finer grouping within category
  mood: ThemeMood;                // Emotional tone
  tags: string[];                 // Searchable tags (min 5 per theme)
  culture?: string;               // e.g. "Japanese", "Nigerian", "Persian", "Universal"
  language?: string;              // Default text language: "en", "es", "ja", "ar", etc.
  awarenessMonth?: number;        // 1–12 for monthly awareness themes
  isNew?: boolean;                // Flag for "New" badge in gallery
  isFeatured?: boolean;           // Flag for featured carousel
  isSeasonal?: boolean;           // Auto-promote during relevant season

  // --- Experience engine (optional) ---
  experienceId?: ExperienceId;            // If set, theme renders as a unique mini-app
  mechanic?: ExperienceMechanic;          // What this theme can DO that others cannot
  bestFor?: string[];                     // Theme intelligence hints ("Best for long-distance")
  experienceDefaults?: ExperienceConfig;  // Seed structured content for the experience

  visual: ThemeVisual;
  content: ThemeContent;
  audio: ThemeAudio;
  delivery: ThemeDelivery;
  interactive?: ThemeInteractive; // Only for funny/interactive themes
  editable: ThemeEditable;

  seo: {
    ogTitle: string;              // Template, use {recipient}, {sender} as placeholders
    ogDescription: string;
  };
}

// ===================== SAVED CARD CONFIG =====================

export interface StickerPlacement {
  stickerId: string;
  x: number;          // percentage 0–100
  y: number;          // percentage 0–100
  rotation: number;   // degrees
  scale: number;      // 0.5–3.0 (proportional)
  scaleX?: number;    // For non-proportional width stretching
  scaleY?: number;    // For non-proportional height stretching
  flipX?: boolean;
  flipY?: boolean;
  color?: string;     // override color for text/shapes
  groupId?: string;   // For linking elements together
  isLocked?: boolean; // Prevent selection and edits in canvas
  props?: Record<string, any>; // Extensible properties for text formatting, cropping, effects, etc.
}

export interface CardConfig {
  title: string;
  subtitle: string;
  body: string;
  recipient: string;
  sender: string;
  palette: ThemePalette;
  fontHeading: string;
  fontBody: string;
  animationSpeed: 'slow' | 'normal' | 'fast';
  animationsEnabled: boolean;
  mediaUrl?: string;
  mediaUrls?: string[];          // For collage layouts
  voiceUrl?: string;             // Voice memo URL
  handwritingData?: string;      // Base64 PNG of signature/handwriting
  ctaYesText?: string;
  ctaNoText?: string;
  ctaPromptText?: string;
  deliveryStyle: DeliveryStyle;
  audioPreset: AudioPresetId;
  audioVolume: number;           // 0.0–1.0
  audioAutoplay: boolean;
  countdownTarget?: string;      // ISO date string
  stickers: StickerPlacement[];  // Sticker overlay positions
  isCollaborative?: boolean;
  maxContributors?: number;
  collabPassword?: string;
  scheduledAt?: string;
  password?: string;
  hasRsvp?: boolean;
  experience?: ExperienceConfig;  // Experience-specific structured content (mini-app data)
  surpriseMode?: boolean;         // Adds a "tap to open" suspense gate before delivery
  emotionalTone?: number;         // 0 (playful) – 100 (heartfelt): drives motion energy & celebration
  dynamicTime?: boolean;          // Adapt the backdrop to the recipient's local time of day
}

export interface SavedCard {
  id: string;
  theme_id: string;
  config: CardConfig;
  delivery_style: DeliveryStyle;
  audio_preset: AudioPresetId;
  is_collaborative: boolean;
  max_contributors: number | null;
  collab_password?: string | null;
  scheduled_at: string | null;
  password_hash: string | null;
  has_rsvp: boolean;
  created_at: string;
  expires_at: string;
  view_count: number;
  creator_secret?: string | null;
  user_id?: string | null;
}

export interface Reaction {
  id: string;
  card_id: string;
  emoji: string;
  message: string | null;
  display_name: string | null;
  created_at: string;
}

export interface Contribution {
  id: string;
  card_id: string;
  display_name: string;
  message: string;
  signature: string | null;
  photo_url: string | null;
  voice_url: string | null;
  sort_order: number;
  created_at: string;
  status?: string;              // 'approved' | 'hidden' (added by collab migration)
  color?: string;              // optional note tint
  contributor_token?: string;  // anonymous identity for own-edit
}

export interface RSVPResponse {
  id: string;
  card_id: string;
  name: string;
  response: 'yes' | 'no' | 'maybe';
  guest_count: number;
  note: string | null;
  created_at: string;
}

// ===================== RENDER PROPS =====================

export interface ThemeRendererProps {
  config: CardConfig;
  mode: 'gallery-mini' | 'editor-preview' | 'full';
  contributions?: Contribution[];
}
