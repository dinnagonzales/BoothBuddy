# 009 — Visual polish (fonts + Booth Buddy brand)

**Type:** HITL  
**Status:** open (code shipped — iPad sign-off pending)  
**Blocked by:** None

## What shipped

Match booth personality + logo palette (post-rebrand; superseded earlier purple mock `#F3E9FF` screen).

- **`constants/visual.ts`** — Fredoka/Nunito, radii, spacing, touch targets
- **`constants/app-fonts.ts`** + `app/_layout.tsx` registration
- **`__tests__/visual-polish-test.ts`**
- Screens: Home, sell (menu steppers, cart, checkout), payment, celebration, owner tabs, `Screen`, `MarketDaySummaryCard`
- Brand tokens swept to logo peach/coral palette (`769b10c`)
- Touch targets ≥ 44×44 where needed

## Acceptance criteria

- [x] Fredoka + Nunito loaded consistently
- [x] Staff + owner screens match brand intent
- [x] Touch targets ok for a 12-year-old
- [ ] Dinna/kid sign-off on iPad visual review

## Blocked by

None
