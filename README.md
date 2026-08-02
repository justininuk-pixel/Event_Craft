# Event Craft

> **Interactive digital card & mini-app platform powered by Next.js 16, React 19, and Tailwind CSS.**

Event Craft lets you create, customize, and send engaging digital greeting cards and interactive mini-apps for birthdays, weddings, holidays, proposals, and special events.

![Event Craft Banner](https://raw.githubusercontent.com/justininuk-pixel/Event_Craft/master/public/globe.svg)

---

## Features

- **500+ Mini-Apps & Themes**: From funny interactive date requests to memory timelines, digital scratch-offs, and puzzle reveals.
- **Dynamic Visual Engines**: Particle systems (stars, sakura, rose petals), confetti cannons, 3D tilt cards, mesh gradients, and glitch overlays.
- **Audio & SFX Integration**: Ambient background presets (acoustic, lofi, synthwave, orchestral) and interactive sound effects.
- **Visual Editor**: Real-time card customization, font pairings, color palettes, and drag-and-drop sticker placement.
- **Delivery Presets**: Interactive unwrapping experiences (wax envelopes, scrolls, gift boxes, holographic portals, paper airplanes).
- **Responsive & Accessible**: Works across desktop and mobile devices with touch and gesture support.

---

## Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm, pnpm, or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/justininuk-pixel/Event_Craft.git
   cd Event_Craft
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional for local dev):
   ```bash
   cp .env.example .env
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
Event_Craft/
├── app/                  # Next.js App Router (pages, API routes)
│   ├── c/[cardId]/       # Card viewer page
│   ├── collab/           # Collaborative editing
│   ├── editor/           # Card editor & customization suite
│   └── explore/          # Mini-app & theme gallery
├── components/           # React UI components
│   ├── editor/           # Visual card editor & sticker tools
│   ├── gallery/          # Theme gallery & filters
│   └── themes/           # Interactive experience mini-apps & visual engines
├── lib/                  # Core logic, themes registry, and audio manager
│   └── themes/           # Theme definitions, palettes, and categories
├── public/               # Static assets (audio tracks, sfx, stickers)
└── supabase/             # Supabase database schema & migrations
```

---

## Documentation

For detailed information about the mini-app architecture, visual engines, and design vision, see [ABOUT.md](./ABOUT.md).

---

## License

This project is licensed under the MIT License, see the [LICENSE](LICENSE) file for details.
