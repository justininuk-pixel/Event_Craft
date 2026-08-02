# About Event Craft

**Event Craft** is an open-source, interactive digital card and micro-experience builder. It transforms ordinary static invitations and digital greetings into memorable, interactive mini-apps that recipients can tap, play, reveal, solve, and explore.

---

## The Vision

Digital greeting cards haven't changed much in twenty years, most are still passive images, PDFs, or basic animated GIFs. 

**Event Craft** was created to change that by turning every message into a personalized micro-experience:
- Want to ask someone out on a date? Send a **Neon Evading Request** where the "No" button dodges their cursor.
- Celebrating a birthday? Let them pop custom balloons, solve a scratch-off card, or play an 8-bit mini-quest.
- Hosting a wedding or reunion? Give guests an audio guestbook, a live sentiment ticker, or a group time-capsule.

---

## Core Platform Architecture

Event Craft is structured around **three main engines**:

1. **Theme Engine & Metadata Registry (`lib/themes/`)**:
   - Over **500+ pre-built themes and mini-apps**, organized across categories (Birthdays, Weddings, Anniversaries, Cultural Celebrations, Memorials, Proposals, Funny Invitations, and Life Events).
   - Dynamic color palettes, Google Fonts pairing, emotional tone scaling (playful to heartfelt), and seasonal logic.

2. **Interactive Experience Host (`components/themes/experiences/`)**:
   - Code-split mini-app host (`ExperienceHost.tsx`) that lazy-loads dedicated React components on demand via `next/dynamic`.
   - Includes physics engines (Matter.js style canvas), gesture controls, audio visualizers, scratch-off reveals, audio scrubbing timelines, and puzzle mechanics.

3. **Customization & Editor Suite (`components/editor/`)**:
   - Visual drag-and-drop sticker placement with multi-selection, rotation, scale, depth layering, and alignment guides.
   - Real-time preview mode, audio preset selector, delivery envelope selector, and share link generator.

---

## Visual & Audio Capabilities

- **Animation Engines**: Particle systems (rose petals, stars, sakura, fireflies), confetti cannons, snowfall, rain, glitch overlays, 3D tilt cards, and audio visualizers.
- **Curated Soundscapes**: Built-in ambient tracks (acoustic guitar, chiptune 8-bit, orchestral, synthwave, traditional instruments) and sound effects (applause, cork pop, camera shutter, typewriter keys).
- **Delivery Mechanics**: Unwrapping animations including wax-sealed envelopes, floating bottles, 3D gift boxes, holographic portals, paper airplanes, and vintage scrolls.

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components)
- **UI & Logic**: [React 19](https://react.dev/), TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons & Assets**: [Lucide Icons](https://lucide.dev/), SVG Sticker Libraries
- **Storage & Database**: Supabase (PostgreSQL, Row-Level Security, Storage Buckets)

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
