/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const AUDIO_DIR = path.join(__dirname, '..', 'public', 'audio');
const SFX_DIR = path.join(__dirname, '..', 'public', 'sfx');
const STICKERS_DIR = path.join(__dirname, '..', 'public', 'stickers');

const AUDIO_PRESETS_LIST = [
  "romantic-piano",
  "upbeat-celebration",
  "gentle-acoustic",
  "epic-orchestral",
  "lofi-chill",
  "jazz-smooth",
  "ambient-nature",
  "retro-synthwave",
  "traditional-chinese",
  "bollywood-festive",
  "african-drums",
  "celtic-harp",
  "japanese-koto",
  "arabic-oud",
  "latin-guitar",
  "solemn-strings",
  "music-box",
  "chiptune-8bit",
  "cinematic-tension",
  "silence"
];

const SFX_LIST = [
  "envelope-open",
  "paper-unfold",
  "gift-unwrap",
  "confetti-pop",
  "whoosh",
  "click-yes",
  "typewriter-key",
  "camera-shutter",
  "coin-insert",
  "slot-machine-spin",
  "magic-sparkle",
  "heartbeat",
  "wind-chime",
  "firework-burst",
  "cork-pop",
  "applause"
];

const STICKER_PACKS_MAP = {
  hearts: {
    "heart-classic": "❤️",
    "heart-outline": "💟",
    "heart-sparkle": "💖",
    "heart-arrow": "💘",
    "heart-envelope": "💌",
    "heart-ribbon": "💝",
    "heart-broken": "💔",
    "heart-double": "💕"
  },
  stars: {
    "star-classic": "⭐",
    "star-outline": "🌟",
    "star-sparkle": "✨",
    "star-shooting": "💫",
    "star-burst": "💥",
    "star-crescent": "🌙",
    "star-badge": "🎖️",
    "star-group": "🌌"
  },
  flowers: {
    "flower-rose": "🌹",
    "flower-sakura": "🌸",
    "flower-sunflower": "🌻",
    "flower-tulip": "🌷",
    "flower-daisy": "🌼",
    "flower-bouquet": "💐",
    "flower-leaf": "🍃",
    "flower-hibiscus": "🌺"
  },
  ribbons: {
    "ribbon-gift": "🎀",
    "ribbon-award": "🎗️",
    "ribbon-corner": "🚩",
    "ribbon-banner": "🏷️",
    "ribbon-bow": "🎀",
    "ribbon-wreath": "🏵️"
  },
  food: {
    "food-cake": "🎂",
    "food-cupcake": "🧁",
    "food-pizza": "🍕",
    "food-burger": "🍔",
    "food-coffee": "☕",
    "food-icecream": "🍦",
    "food-cookie": "🍪",
    "food-cheers": "🥂"
  },
  animals: {
    "animal-cat": "🐱",
    "animal-dog": "🐶",
    "animal-bear": "🐻",
    "animal-rabbit": "🐰",
    "animal-panda": "🐼",
    "animal-fox": "🦊",
    "animal-lion": "🦁",
    "animal-paw": "🐾"
  },
  celebration: {
    "celebration-balloon": "🎈",
    "celebration-popper": "🎉",
    "celebration-hat": "🥳",
    "celebration-champagne": "🍾",
    "celebration-gift": "🎁",
    "celebration-trophy": "🏆",
    "celebration-fireworks": "🎆",
    "celebration-disco": "🪩"
  },
  emoji: {
    "emoji-smile": "😊",
    "emoji-love": "😍",
    "emoji-laugh": "😂",
    "emoji-cry": "😭",
    "emoji-party": "🥳",
    "emoji-mindblown": "🤯",
    "emoji-sunglasses": "😎",
    "emoji-wink": "😉"
  },
  religious: {
    "religious-cross": "✝️",
    "religious-crescent": "🌙",
    "religious-star-david": "🔯",
    "religious-om": "🕉️",
    "religious-lotus": "🪷",
    "religious-dove": "🕊️",
    "religious-candle": "🕯️",
    "religious-prayer-hands": "🙏"
  },
  weather: {
    "weather-sun": "☀️",
    "weather-cloud": "☁️",
    "weather-rainbow": "🌈",
    "weather-snowflake": "❄️",
    "weather-lightning": "⚡",
    "weather-umbrella": "☔",
    "weather-moon": "🌙",
    "weather-wind": "💨"
  }
};

// Base64 representation of a valid silent MP3 (approx. 30ms)
const SILENT_MP3_BASE64 = "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjM2LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV6urq6urq6urq6urq6urq6urq6urq6urq6v////////////////////////////////8AAAAATGF2YzU2LjQxAAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//MUZAAAAAGkAAAAAAAAA0gAAAAATEFN//MUZAMAAAGkAAAAAAAAA0gAAAAARTMu//MUZAYAAAGkAAAAAAAAA0gAAAAAOTku//MUZAkAAAGkAAAAAAAAA0gAAAAANVVV";

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

async function downloadOrWriteSilentMp3(targetPath) {
  const buffer = Buffer.from(SILENT_MP3_BASE64, 'base64');
  fs.writeFileSync(targetPath, buffer);
}

function createEmojiSvg(emoji) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <text y="75" x="50" font-size="70" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">${emoji}</text>
</svg>`;
}

async function main() {
  console.log("Setting up CelebrationCraft assets...");

  // 1. Create directories
  ensureDir(AUDIO_DIR);
  ensureDir(SFX_DIR);
  ensureDir(STICKERS_DIR);

  // 2. Write audio presets
  for (const preset of AUDIO_PRESETS_LIST) {
    const filePath = path.join(AUDIO_DIR, `${preset}.mp3`);
    await downloadOrWriteSilentMp3(filePath);
  }
  console.log(`Generated ${AUDIO_PRESETS_LIST.length} placeholder background music files.`);

  // 3. Write SFX files
  for (const sfx of SFX_LIST) {
    const filePath = path.join(SFX_DIR, `${sfx}.mp3`);
    await downloadOrWriteSilentMp3(filePath);
  }
  console.log(`Generated ${SFX_LIST.length} placeholder SFX files.`);

  // 4. Generate stickers
  for (const [packName, stickers] of Object.entries(STICKER_PACKS_MAP)) {
    const packDir = path.join(STICKERS_DIR, packName);
    ensureDir(packDir);

    for (const [stickerId, emoji] of Object.entries(stickers)) {
      const svgContent = createEmojiSvg(emoji);
      // Write to subfolder
      fs.writeFileSync(path.join(packDir, `${stickerId}.svg`), svgContent, 'utf8');
      // Write to top-level folder
      fs.writeFileSync(path.join(STICKERS_DIR, `${stickerId}.svg`), svgContent, 'utf8');
    }
    console.log(`Generated stickers for pack: ${packName}`);
  }

  // 5. Validation pass
  console.log("Running sticker SVG validation pass...");
  let missingCount = 0;
  for (const [packName, stickers] of Object.entries(STICKER_PACKS_MAP)) {
    for (const stickerId of Object.keys(stickers)) {
      const subpath = path.join(STICKERS_DIR, packName, `${stickerId}.svg`);
      const toppath = path.join(STICKERS_DIR, `${stickerId}.svg`);
      if (!fs.existsSync(subpath) || !fs.existsSync(toppath)) {
        console.warn(`⚠️ Missing SVG file for sticker: ${stickerId}`);
        missingCount++;
      }
    }
  }
  if (missingCount === 0) {
    console.log("✅ All sticker SVG files verified and present on disk.");
  } else {
    console.warn(`⚠️ Warning: ${missingCount} sticker SVG files are missing.`);
  }

  console.log("CelebrationCraft assets setup complete!");
}

main().catch(err => {
  console.error("Error setting up assets:", err);
  process.exit(1);
});
