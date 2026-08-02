# Plan: Editor (Canva-parity+) & Visual/UX Overhaul

## A. Editor — "all of Canva and more"

Current editor has a left tool rail (Elements/Media/Stickers/Audio/AI), a phone-frame
canvas, and a properties sidebar. It's thin and several tools are shallow. Target a
real design surface plus celebration-specific power tools Canva doesn't have.

### Canva-parity foundations
- **Robust canvas engine**: multi-select, marquee select, group/ungroup, lock, z-order,
  align/distribute, smart snap guides + grid, nudge with arrows, copy/paste/duplicate,
  rotate handles, aspect-lock resize. (Some sticker logic exists in `TransformableSticker`;
  harden into a proper layer system with a **Layers panel**.)
- **Text**: rich text (font, size, weight, color, spacing, line-height, align, lists),
  curved text, text effects (shadow/outline/glow), font pairing presets, 30+ fonts.
- **Elements**: shapes, lines, icons (lucide set), frames/masks (place photo into shape),
  charts/stickers, gradients & patterns, background remover (`@imgly/background-removal`
  is already a dep — wire it into Media).
- **Media**: upload, crop, filters/adjustments (brightness/contrast/saturation/blur),
  background removal, image search/stock (optional), GIFs.
- **Brand kit**: saved palettes, fonts, logos; one-click apply.
- **Pages/scenes**: multi-page cards (needed for Story Mode), reorder, duplicate.
- **History**: full undo/redo (exists) + version snapshots; autosave (exists) + named drafts.
- **Productivity**: keyboard shortcuts (exists for undo) extended; right-click context menu;
  command palette inside editor; templates/quick-starts.
- **Export**: PNG (exists) + multi-page, plus the shareable link (the real output).

### Beyond Canva (celebration-specific)
- **Experience editor panels** per mechanic (started: `ExperienceEditor`) — timeline/layers/
  puzzle/voice/canvas/quiz builders.
- **AI assist** that actually writes copy per occasion/tone (wire `app/api/ai`), suggests
  themes ("best for"), and generates color palettes.
- **Emotional Tone** + **Dynamic Time** + **Surprise Mode** (done) surfaced in a "Vibe" panel.
- **Recipient Simulator** (done) as the primary preview.
- **Collaboration** controls (see COLLABORATION-PLAN).

### Build order
1. Layer system + Layers panel + multi-select/align/snap hardening.
2. Rich text + frames/masks + background remover wired.
3. Pages/scenes + brand kit.
4. Adjustments/filters + element library expansion.
5. Per-mechanic experience builders (tracks THEME-PLAN batches).

## B. Visual / UX overhaul — make the whole flow beautiful & intuitive

### Problems
Flow feels utilitarian; dark-only; dense dashboards; weak hierarchy; theme cards/in-card
UIs inconsistent (e.g. evading buttons — fixed). Onboarding/empty states thin.

### Direction
- **Design system pass**: tighten tokens (spacing scale, radius, shadows, type scale),
  one cohesive accent system, consistent component states (hover/active/focus/disabled/
  loading) across Button/Input/Card/Modal/Sheet. Add **light mode** (tokens exist; audit
  every surface for contrast).
- **Information architecture**: a clear primary flow — *Pick an experience → Personalise →
  Preview → Share*. Reduce dashboard noise on first run; progressive disclosure.
- **Home**: lead with experiences (done) + a strong hero, "occasion" entry points, and a
  guided "what are you celebrating?" picker that recommends themes (ties to Theme Intelligence).
- **Gallery**: the Type filter (done) + occasion/mood facets, live mechanic previews (done),
  "Trending" badge (read path ready), and a "Surprise me" button.
- **Editor**: the mobile bottom-sheet (done) + a guided first-run ("3 steps to your card"),
  clearer toolbars, single "Preview" (done).
- **Motion & polish**: consistent page transitions, skeletons, optimistic UI, celebratory
  micro-interactions, empty/onboarding states with personality.
- **Accessibility**: focus rings, reduced-motion (respected in experiences), 44px targets,
  semantic landmarks, captions for voice/video.

### Build order
1. Design-system + light-mode pass (tokens + core components).
2. Guided primary flow + home hero + occasion picker.
3. Theme UI audit — every experience/style theme meets the quality bar (THEME-PLAN §5).
4. Onboarding, empty states, transitions, a11y sweep.
