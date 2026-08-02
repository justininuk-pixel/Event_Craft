# Plan: Collaboration Overhaul

> Goal: group cards that actually work — many people contribute messages, photos,
> voice, drawings, or signatures to one card, in real time, and it renders
> beautifully in the chosen theme.

## 1. Why it's broken today
- **Pro-gated at creation.** `POST /api/cards` rejects collaborative cards unless the user is a non-anon *Pro* (`route.ts`). Anonymous/most users literally cannot create one → "doesn't work at all."
- **Contributions aren't rendered in the card.** The viewer fetches `initialContributions` and passes them to `ThemeStage`, but the **experience engine ignores them** and most style themes don't surface them meaningfully. Contributors submit into a void.
- **No real-time.** Contributors/creator don't see new entries without a manual refresh (`contributionsCount` is fetched once).
- **No moderation / ordering / dedupe.** Creator can't approve, reorder, hide, or remove entries.
- **Contributor UX is a plain form**, with no live preview of how the entry will appear and no confirmation/identity persistence.
- **Schema is thin.** `contributions` has no `status`, `kind`, or `sticker`/reaction support.

## 2. How it SHOULD work

### Roles & links
- Any creator can toggle **Group Card** on a theme (remove the hard Pro gate; optionally keep generous limits for free, higher for Pro).
- Creating yields **two links**: a **contributor link** (`/collab/:id`) to invite people, and the normal **recipient link** (`/c/:id`) for the final reveal. Creator keeps a **manage** view (gated by `creator_secret`).

### Contributor flow (`/collab/:id`)
1. Open link → see the card's theme + a friendly "Add your bit to [recipient]'s card" header + current contributor count and any deadline.
2. Optional passcode gate (existing `collab_password`).
3. Compose entry with a **live preview** of exactly how it will appear: name, message, optional photo, 30s voice note, drawn signature, sticker/emoji, color accent.
4. Submit → optimistic insert → **appears live for everyone** (Supabase Realtime).
5. Identity remembered (localStorage) so a person can edit/delete *their own* entry.

### Creator manage flow
- See all entries live, **approve / hide / reorder (drag) / delete**, set a **deadline** and **max contributors**, and a "lock & reveal" action.
- Share sheet with QR + one-tap invites.

### Recipient flow (`/c/:id`)
- The card renders all (approved) contributions inside the theme. Two rendering modes:
  - **Group layouts** for style themes: a signed "Group Card" wall / scrapbook / book of pages.
  - **Collaborative experiences** (ties to THEME-PLAN): engines designed for many authors —
    - **Live Canvas** (everyone draws/signs on one canvas),
    - **Memory Timeline (group)** — each person adds a moment,
    - **Wish Jar** — each person drops a wish,
    - **Voice Story (group)** — a sequence of everyone's voice notes,
    - **Reaction Wall** — stamps/notes on a shared board.

## 3. Data model

Extend `public.contributions` (migration):
- `kind TEXT` — `message | photo | voice | drawing | sticker` (default `message`).
- `status TEXT` — `pending | approved | hidden` (default `approved`; creator can require approval).
- `color TEXT NULL`, `sticker_id TEXT NULL` — for accent/sticker entries.
- `contributor_token TEXT NULL` — anonymous identity so contributors can edit/delete their own.
- keep `sort_order` (now drag-controlled).

RLS: public `SELECT` of `approved`; public `INSERT`; `UPDATE`/`DELETE` only via creator-secret RPC or own `contributor_token` (SECURITY DEFINER RPCs).

## 4. Realtime
- Supabase Realtime channel per card (`contributions:card_id=eq.:id`).
- Contributor + manage + viewer pages subscribe → live add/update/remove with framer-motion enter/exit.

## 5. API surface
- `POST /api/cards/:id/contributions` — add (returns `contributor_token`).
- `PATCH /api/cards/:id/contributions/:cid` — edit own (token) or moderate (secret).
- `DELETE …` — own (token) or moderate (secret).
- `GET …?status=approved` — public list; manage view passes secret for all.
- Drop the Pro requirement in `POST /api/cards` for `isCollaborative` (or gate only premium caps).

## 6. Rendering contract
- `ExperienceHost`/`ThemeStage` already receive `contributions`; thread them into engines that opt in via `supportsCollaboration` + a `<CollaborativeLayer />`.
- Provide a default **GroupCardLayout** used by any non-collaborative-aware theme so contributions always render somewhere good.

## 7. Build order
1. **Unblock + render:** remove Pro gate; add `GroupCardLayout`; make the viewer show contributions for every theme. (makes it "work" end-to-end)
2. **Realtime + live preview** on contributor page.
3. **Manage view:** approve/reorder/delete + deadline/limits + share.
4. **Schema migration** (`kind/status/color/sticker_id/contributor_token`) + RPCs (written to `supabase/migrations/`, you run them).
5. **Collaborative experiences:** Live Canvas, Group Memory Timeline, Wish Jar, Group Voice Story, Reaction Wall.

Migrations will be written into `supabase/migrations/` with a clear "run this in Supabase" note; the app will no-op gracefully until they're applied.
