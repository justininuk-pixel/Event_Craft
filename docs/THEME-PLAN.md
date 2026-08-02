# Plan: 500 Genuinely Unique Themes (mini-apps)

> Goal: every theme is a **mini-app with a unique mechanic**, not a style swap.
> A theme qualifies as "unique" only if it differs from others in at least one of:
> **STRUCTURE · INTERACTION · PURPOSE · FLOW · INPUT TYPE.**

## 1. The core idea: Mechanic Engines × Purposes

We don't hand-author 500 unrelated components. We build **~60 distinct "mechanic engines"** (the unique interaction/structure primitives) and instantiate each across **occasions/purposes** to reach 500. Because PURPOSE and FLOW are valid uniqueness axes, the same engine used for *"Will you marry me?"* vs *"Come to my party?"* vs *"Forgive me?"* yields three genuinely different experiences (different purpose, copy, flow, sometimes input).

```
500 themes ≈ 60 mechanic engines  ×  ~8 purpose/occasion instances (curated)
```

Each instance is configured (content, flow, allowed inputs, default style) and **content + style stay editable**, while the **mechanic is fixed** — that is what keeps STYLE separate from STRUCTURE.

### Architecture
- `lib/themes/experiences/` registry: each engine = `{ id, component, defaultData schema, mechanic metadata, supportedInputs }`.
- A `Theme` references an engine via `experienceId` (already in place) + carries instance config (`experienceDefaults`, `mechanic`, `bestFor`, purpose, occasion, style).
- `ExperienceHost` dispatches to the engine component (already in place — currently 4 engines wired).
- Theme definitions are generated per category from a typed factory so 500 entries stay maintainable and lint-clean.

## 2. The Mechanic Engines (target ~60)

Legend: ✅ built · 🔶 exists as interactive component, needs wrapping as engine · ⬜ to build.

### Reveal & anticipation
1. ✅ **Memory Timeline** — scroll a shared history; tap to unlock each moment.
2. ✅ **Unlock Layers** — peel nested layers, each a deeper message.
3. ✅ **Future Message** — sealed until a date; live countdown.
4. ✅ **Puzzle Reveal** — solve a word scramble to unlock.
5. ⬜ **Scratch Card** — scratch off coating to reveal (🔶 ScratchReveal exists).
6. ⬜ **Gift Unwrap** — multi-tap to tear through wrapping layers.
7. ⬜ **Advent / Calendar Doors** — open one door per day; daily messages.
8. ⬜ **Combination Vault** — dial a code (date, name) to open.
9. ⬜ **Fortune Cookie** — crack to reveal a fortune.
10. ⬜ **Polaroid Develop** — photo develops from white (🔶 delivery exists).
11. ⬜ **Constellation** — connect stars to draw a shape/word.
12. ⬜ **Glitch Decode** — digital text decodes/resolves into the message.

### Games (game-like flow)
13. 🔶 **Yes Game** (evading/cannot-say-no) — catch the YES. (EvadingButton ✅ fixed)
14. 🔶 **Slot Machine** — spin → always lands on the message.
15. 🔶 **Spin the Wheel** — every segment is a "yes"/prize.
16. 🔶 **Magic 8-Ball** — shake/tap → reveal.
17. 🔶 **Gravity / Physics fling** — physics interaction to reach the message.
18. ⬜ **Jigsaw Puzzle** — drag pieces to assemble a photo/message.
19. ⬜ **Balloon Pop** — pop balloons to spell out the message.
20. ⬜ **Piñata** — swing to break; candy + message burst out.
21. ⬜ **Quiz / "How well do you know me"** — answer → score + reveal.
22. ⬜ **Trivia Reveal** — correct answers unlock segments.
23. ⬜ **Scavenger Hunt** — clue → clue → final reveal (multi-step).
24. ⬜ **Choose-Your-Own-Adventure** — branching narrative (FLOW = branching).
25. ⬜ **Tap-to-Grow** — tap to grow a plant/cake/tree → blooms into message.
26. ⬜ **Whack / Catch** — catch falling hearts/gifts to fill a meter.
27. ⬜ **Memory Match** — flip-card pairs; clearing the board reveals.

### Expressive & emotional
28. ⬜ **Reaction Gesture** — tap and an animated hand performs a gesture: 🖕 (the "fuck you" card), 🤝 high-five, 🤗 hug, 👏 applause, 🤙, 🖤. PURPOSE-driven (petty/funny/affection).
29. ⬜ **Apology Builder** — escalating sorry: flowers → puppy eyes → grovel meter.
30. ⬜ **Roast Card** — playful insults reveal one by one (funny).
31. ⬜ **Meme Card** — classic meme format, fully editable top/bottom text.
32. ⬜ **Confession** — slow, tap-paced reveal of one hard-to-say thing.
33. ⬜ **Heartbeat / Pulse** — tap in rhythm; a heartbeat carries the message.
34. ⬜ **Wish Jar** — drop folded wishes into a jar (collaborative-friendly).
35. ⬜ **Lantern Release** — write a wish, release a sky lantern (cultural).

### Story & media (input type varies)
36. ⬜ **Story Mode** — multi-page book/narrative with page-turn. *(requested)*
37. ⬜ **Voice Story Card** — voice notes play in sequence, podcast-style. *(requested · INPUT=voice)*
38. ⬜ **Live Canvas** — contributors draw/sign on a shared canvas in real time. *(requested · INPUT=draw, collaborative)*
39. ⬜ **Karaoke / Lyric Card** — synced lyric reveal to a track.
40. ⬜ **Mixtape / Playlist** — a track list you can play, with a note per song.
41. ⬜ **Audio Visualizer Message** — waveform reacts to a recorded voice note.
42. ⬜ **Flip-Book Animation** — frame-by-frame hand-drawn animation.
43. ⬜ **Photo Collage Reveal** — fragments fly in to assemble one photo.

### Events, invites & logistics (PURPOSE = invitation/coordination)
44. ⬜ **Boarding Pass / Ticket** — tear-off event ticket with details + add-to-calendar.
45. ⬜ **Map Journey** — animated route reveal (trips, "let's go here").
46. ⬜ **RSVP Game** — interactive seat picker / yes-no-maybe with live tally.
47. ⬜ **Poll / Vote** — recipient votes; creator sees aggregate (uses DB).
48. ⬜ **Countdown Event Hub** — flip-clock to an event + details + RSVP.
49. ⬜ **Recipe Card** — interactive step-through recipe (food occasions).
50. ⬜ **Schedule / Itinerary** — tap through an agenda (weddings, trips).

### Ceremony & achievement
51. ⬜ **Award Ceremony** — curtain/spotlight reveal of a trophy.
52. ⬜ **Report Card** — graded "achievements" with witty remarks.
53. ⬜ **Certificate** — animated seal-stamp certificate.
54. ⬜ **Fireworks Conductor** — tap the sky to launch fireworks (NYE, wins).
55. ⬜ **Candle Blow** — blow into mic to extinguish candles → birthday reveal *(INPUT=mic)*.
56. ⬜ **Confetti Cannon** — hold to charge, release celebration.

### Cultural & ceremonial packs *(requested "Cultural Experience")*
57. ⬜ **Cultural Experience** engine — authentic art motif + music + animation per culture (Diwali rangoli, Lunar New Year red-envelope, Eid crescent, Holi color-throw, Hanukkah menorah, Kwanzaa kinara, etc.). Each pack = a culturally specific mechanic (e.g. tap to light each menorah candle; throw Holi colors; open a hongbao).

### Structural classics
58. 🔶 **Pop-up Book** (3D paper craft) — PopUpCard engine exists.
59. 🔶 **Typewriter Letter** — char-by-char letter — engine exists.
60. ⬜ **Message in a Bottle / Paper Airplane interactive** — wrap delivery into a full mini-app.

## 3. Mapping to 500 (occasion catalog)

Each engine is instantiated across the occasion matrix below; not every engine fits every occasion — we curate the combinations that are genuinely good, targeting ~500 high-quality instances.

Occasion groups: Romance · Proposal · Birthday · Wedding · Anniversary · Friendship · Family (mom/dad/siblings/grandparents) · New Baby · Apology · Thank-you · Get-well · Sympathy/Memorial · Congrats/Graduation/New-job/Promotion/New-home · Invitations (party/dinner/game-night/trip) · Funny/Roast/Petty/Meme · Cultural & Religious festivals · Seasonal holidays · Professional/Work · Awareness/Causes · Pets · Travel · Food & Drink · Sports · Wellness.

Example — the **Reaction Gesture** engine alone yields several distinct themes by PURPOSE:
`gesture-flip-off` ("A message for someone who deserves it" 🖕) · `gesture-high-five` (congrats) · `gesture-hug` (miss you / comfort) · `gesture-applause` (achievement) · `gesture-fist-bump` (friendship).

## 4. Build order (batches)

- **Batch 0 (done):** engine architecture + 4 experiences + wire existing interactive components.
- **Batch 1:** the requested + emblematic engines — Reaction Gesture (incl. 🖕), Story Mode, Voice Story, Live Canvas (ties into Collaboration plan), Scratch Card, Gift Unwrap. (~25 themed instances)
- **Batch 2:** games — Jigsaw, Balloon Pop, Piñata, Quiz/Trivia, Tap-to-Grow, Memory Match. (~60 instances)
- **Batch 3:** events/invites — Ticket, Map Journey, RSVP Game, Poll, Countdown Hub, Recipe, Itinerary. (~70)
- **Batch 4:** ceremony/achievement + media — Award, Certificate, Fireworks, Candle Blow, Karaoke, Mixtape, Collage. (~80)
- **Batch 5:** cultural packs (one mechanic per major festival). (~60)
- **Batch 6:** reveal/anticipation remainder + classics, then fill the occasion matrix to 500 with curated instances. (~remaining)

Every batch ships with: the engine component (gallery-mini + editor-preview + full modes), a tailored editor panel (extends `ExperienceEditor`), metadata (`mechanic`, `bestFor`), and is verified in the simulator.

## 5. Quality bar (applies to ALL themes — fixes the "bad UI" issue)
- Consistent button system (rounded-2xl, min sizes, no shape warping — the evading-button bug is the canonical example, now fixed).
- Responsive + mobile-first; safe-area aware; legible contrast on any palette (use `color-mix` against `--exp-text`).
- Respects `prefers-reduced-motion`; no render-phase impurity.
- Looks good in light AND dark palettes.
- Every theme passes the simulator review before being marked done.
