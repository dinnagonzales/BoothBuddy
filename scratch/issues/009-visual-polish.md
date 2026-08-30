# 009 — Visual polish (mock fonts + spacing)

**Type:** HITL  
**Status:** open (code shipped — iPad sign-off pending)  
**Blocked by:** None — can start immediately

## What to build

Match [mocks/screens.html](../../mocks/screens.html): load Fredoka (headings/buttons) and Nunito (body), tune spacing and radii on existing HeroUI screens. Kid and admin should do a quick visual pass on iPad before Sep 18 fair.

Human review required before calling done — kid should confirm it "feels right" at the booth.

## What shipped

- **`constants/visual.ts`** — Fredoka/Nunito family names, radii, spacing, and touch-target minimums locked to the mock
- **`constants/app-fonts.ts`** — single font registration map used by `app/_layout.tsx`
- **`__tests__/visual-polish-test.ts`** — guards tokens against mock drift
- **Screens wired:** Home, sell (menu **− / qty / +** steppers, read-only cart, green checkout), payment, celebration, grown-up settings, `Screen` primitives, `MarketDaySummaryCard`
- **Screen background** unified to `#F3E9FF` via `colors.screen` in `constants/theme.ts`
- **Add button** touch target raised to 44×44 (mock is 30px; booth use needs larger taps)

## Acceptance criteria

- [x] Fredoka + Nunito loaded and applied consistently
- [x] **Home**, sell, payment, celebration, and grown-up settings match mock intent
- [x] Touch targets remain large enough for a 12-year-old (no regression)
- [ ] Dinna/kid sign off on iPad visual review

## Blocked by

None — can start immediately
