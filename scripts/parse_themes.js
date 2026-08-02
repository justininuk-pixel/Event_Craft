const fs = require('fs');
const path = require('path');

const planDir = path.join(__dirname, '../Plan');
const outPath = path.join(__dirname, '../lib/themes/definitions/plan-themes.ts');

const files = fs.readdirSync(planDir).filter(f => f.endsWith('.md') && f.startsWith('themes_'));

// Sort files to process them in order
files.sort();

const themes = [];

// Track ids so duplicate theme names can never produce duplicate ids (which crash
// the gallery via React key collisions). The experienceId stays on the base id so the
// variant still dispatches to its mini-app; only the public id is suffixed.
const usedIds = new Set();
function uniqueId(baseId) {
  if (!usedIds.has(baseId)) { usedIds.add(baseId); return baseId; }
  let n = 2;
  while (usedIds.has(`${baseId}-${n}`)) n++;
  const finalId = `${baseId}-${n}`;
  usedIds.add(finalId);
  return finalId;
}

// Fallbacks for required fields
const DEFAULT_PALETTE = { primary: "#2563eb", secondary: "#eff6ff", accent: "#60a5fa", background: "#0b1329", text: "#dbeafe", textSecondary: "#93c5fd" };
const DEFAULT_FONTS = { heading: "Inter", body: "Inter" };

// Map the markdown category text to the strict ThemeCategory enum
function mapCategory(text) {
  const t = text.toLowerCase();
  if (t.includes('romance')) return 'romance';
  if (t.includes('birthday')) return 'birthday';
  if (t.includes('family')) return 'family';
  if (t.includes('funny')) return 'funny';
  if (t.includes('collaborative') || t.includes('social')) return 'life-event';
  if (t.includes('game') || t.includes('puzzle')) return 'funny';
  if (t.includes('surprise') || t.includes('reveal')) return 'life-event';
  return 'life-event'; // Default category
}

function kebabCase(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

for (const file of files) {
  const content = fs.readFileSync(path.join(planDir, file), 'utf8');
  
  // Regex to parse the structure. 
  // Each block looks like:
  // ### <num>. <Title>
  // * **Purpose:** <purpose>
  // * **Category:** <category>
  // * **Unique Functionality:** <func>
  // * **Interaction Model:** <interaction>
  // * **Structural Layout:** <layout>
  // * **Editor Customization Options:**
  //   * *Content:* <c>
  //   * *Behavior:* <b>
  //   * *Structure:* <s>
  // * **Superpower:** <super>
  
  // Because some sections might have newlines or slightly different whitespace, we'll use a more flexible regex or manual splitting.
  const blocks = content.split('### ').slice(1);
  
  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);
    
    // First line is number. Title
    const titleMatch = lines[0].match(/^\d+\.\s+(.*)/);
    if (!titleMatch) continue;
    const name = titleMatch[1];
    
    let purpose = '', categoryText = '', functionality = '', interaction = '', layout = '', superpower = '';
    
    for (const line of lines) {
      if (line.startsWith('* **Purpose:**')) purpose = line.replace('* **Purpose:**', '').trim();
      if (line.startsWith('* **Category:**')) categoryText = line.replace('* **Category:**', '').trim();
      if (line.startsWith('* **Unique Functionality:**')) functionality = line.replace('* **Unique Functionality:**', '').trim();
      if (line.startsWith('* **Interaction Model:**')) interaction = line.replace('* **Interaction Model:**', '').trim();
      if (line.startsWith('* **Structural Layout:**')) layout = line.replace('* **Structural Layout:**', '').trim();
      if (line.startsWith('* **Superpower:**')) superpower = line.replace('* **Superpower:**', '').trim();
    }
    
    const baseId = kebabCase(name);
    const id = uniqueId(baseId);

    const themeObj = {
      id,
      name,
      description: purpose || 'A unique interactive experience.',
      emoji: '✨',
      category: mapCategory(categoryText),
      subcategory: categoryText,
      mood: 'celebratory', // Default
      tags: [baseId, 'interactive', 'experience'],

      // experienceId stays on the base id so duplicate-name variants still dispatch.
      experienceId: baseId,
      mechanic: {
        structure: layout || 'custom',
        interaction: interaction || 'custom',
        purpose: purpose || 'custom',
        flow: 'game-like',
        inputType: ['text', 'photo'],
        summary: superpower || functionality
      },
      
      visual: {
        palette: DEFAULT_PALETTE,
        backgroundType: 'solid',
        fonts: DEFAULT_FONTS,
        borderRadius: 'md',
        layout: 'centered',
        animationEngine: 'none',
        animationConfig: {}
      },
      content: {
        title: name,
        recipientLabel: "recipient",
        senderLabel: "sender",
        supportsMedia: true,
        supportsVoice: true,
        supportsHandwriting: true,
        supportsCollage: false
      },
      audio: {
        defaultPreset: 'none',
        volume: 0.5,
        autoplay: true,
        loop: true
      },
      delivery: {
        defaultStyle: 'none',
        allowedStyles: ['none'],
        deliveryDuration: 1000
      },
      editable: {
        title: true, subtitle: true, body: true, recipient: true, sender: true,
        palette: true, fonts: true, animationSpeed: true, media: true,
        voice: true, handwriting: true, ctaText: false, deliveryStyle: true,
        audioPreset: true, countdownTarget: false, stickers: true
      },
      seo: {
        ogTitle: `${name} for {recipient}`,
        ogDescription: `Open this card to view your special greeting.`
      }
    };
    
    themes.push(themeObj);
  }
}

let outCode = `// GENERATED FILE. DO NOT EDIT.
import { Theme } from "../types";

export const PLAN_THEMES: any[] = ${JSON.stringify(themes, null, 2)};
`;

fs.writeFileSync(outPath, outCode);
console.log(`Parsed ${themes.length} themes.`);
