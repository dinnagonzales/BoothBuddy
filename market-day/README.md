# Market Day (Expo)

Kid-friendly POS for iPad testing via **Expo Go** — no Apple Developer account required yet.

## Run on your iPad today

1. Install **[Expo Go](https://apps.apple.com/app/expo-go/id982107779)** on your iPad.
2. On your Mac, from this folder:

   ```bash
   npm start
   ```

3. Scan the QR code with your iPad camera (same Wi‑Fi as your Mac).
4. Market Day opens inside Expo Go.

## What's working

- **Home** — Items menu (no sales totals); optional Market Day banner; **Make a Sale** (always) + **+ Pre-order**
- **Make a Sale** — always available; attaches to active Market Day when one is open; off-day sales save to Running Tab with optional name/notes
- **+ Pre-order** — required name/notes/complete date, Pay on pickup, global catalog, always Running Tab (even during a fair)
- **Sell flow** — menu **− / qty / +** steppers, read-only cart (**Name(qty)** + **N items** total), payment (**Order Total**; cash-entry: **Amount Paid** → chips → change → **Keep change?**; Cash / Venmo-Zelle selectors below; pay on pickup for preorders)
- **Celebration** — Edit this sale / Go to Dashboard; tap ✕ → Home
- **Settings** — Active Market Day dashboard (sales, profit, Cash with tips breakdown, Venmo/Zelle; Today's Menu, sales list)
- **Past Events** — closed days on Settings empty state; detail view with export + Reopen
- **Start Market Day** — name + date form in grown-up settings (date defaults to today)
- **Sales tab** — all-time sales across Market Days + Running Tab export
- **Preorders tab** — prep summary (what to make), overdue/upcoming sections sorted by complete date, printable export, open preorders; mark complete from admin edit
- **Inventory** — item CRUD, archive, delete (when no past sales)
- **Sale detail (admin)** — edit payment method, optional name/notes/complete date (preorders), remove sale
- **Export** — closed Market Day + Running Tab date range (CSV with **Change kept** column + tips summary footer) + preorder printout (text) → share sheet
- **Parental gate** — 4-digit Pass Code for grown-up area (`expo-secure-store`)
- **SQLite** — local-first data on device

## UI

Visual design matches [../mocks/screens.html](../mocks/screens.html).

- **[HeroUI Native](https://heroui.com/)** + **Uniwind** (Tailwind-style `className` where convenient)
- **Fonts** — Fredoka (headings/prices/buttons), Nunito (body/labels); loaded via `expo-font` in `app/_layout.tsx`
- **Tokens** — `constants/visual.ts` (fonts, radii, spacing, touch targets), `constants/theme.ts` (colors), `global.css` (HeroUI semantic tokens)
- **Layout helpers** — `components/Screen.tsx` (`Screen`, `ScreenHeader`, `SectionLabel`, `ItemCard`)
- **Reusable UI** — `components/ui/` (`Button`, `Card`, `Chip`, `Input`, …)

Seller screens use explicit `StyleSheet` + token imports so typography stays consistent; celebration and payment labels no longer rely on generic system bold.

## Project layout

```
app/              screens (expo-router)
components/       shared UI
constants/        theme colors, visual tokens, app font map
context/          cart state during checkout
lib/db/           schema + queries
__tests__/        domain + visual-polish tests
```

## Tests

```bash
npm test
```

Includes `visual-polish-test.ts` — locks typography, radii, spacing, and font registration to the mock.

## Next build steps

- **009 HITL** — iPad visual pass with kid at the booth
- Item photos ([008](../scratch/issues/008-item-photos.md))
- App Store / TestFlight build ([010](../scratch/issues/010-app-store-submission.md))

## App Store path (later)

When ready for TestFlight / App Store:

1. Enroll in [Apple Developer Program](https://developer.apple.com/programs/enroll/) ($99/yr)
2. `npm install -g eas-cli && eas build --platform ios`
3. `eas submit --platform ios`

See [../docs/adr/0001-expo-local-first-stack.md](../docs/adr/0001-expo-local-first-stack.md) and [../PRD.md](../PRD.md).
