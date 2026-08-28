# Market Day (Expo)

Kid-friendly POS scaffold for iPad testing via **Expo Go** — no Apple Developer account required yet.

## Run on your iPad today

1. Install **[Expo Go](https://apps.apple.com/app/expo-go/id982107779)** on your iPad.
2. On your Mac, from this folder:

   ```bash
   npm start
   ```

3. Scan the QR code with your iPad camera (same Wi‑Fi as your Mac).
4. Market Day opens inside Expo Go.

## What's working in this scaffold

- **Home** — Items menu (no sales totals)
- **Sell flow** — pick Items, cart ±, payment (cash w/ change + Venmo/Zelle)
- **Celebration** — Fix reopens cart; tap away → Home
- **Settings** — Market Day stats (parental gate + export coming soon)
- **SQLite** — seeded demo Items + demo Market Day on first launch

## UI

- **[HeroUI Native](https://heroui.com/)** + **Uniwind** (Tailwind-style `className` on iOS)
- Reusable exports: `components/ui/` (`Button`, `Card`, `Chip`, `Input`, …)
- Layout helpers: `components/Screen.tsx`
- Theme tokens: `global.css` (Market Day purple/lavender palette)

## Project layout

```
app/           screens (expo-router)
components/    shared UI
context/       cart state during checkout
lib/db/        schema + queries
constants/     theme colors from mocks
```

## Next build steps

- Parental code gate (`expo-secure-store`)
- Item CRUD + archive
- Market Day close / undo close / export CSV (`expo-sharing`)
- Admin edit sales
- Running Tab sales from settings

## App Store path (later)

When ready for TestFlight / App Store:

1. Enroll in [Apple Developer Program](https://developer.apple.com/programs/enroll/) ($99/yr)
2. `npm install -g eas-cli && eas build --platform ios`
3. `eas submit --platform ios`

See [../docs/adr/0001-expo-local-first-stack.md](../docs/adr/0001-expo-local-first-stack.md) and [../PRD.md](../PRD.md).
