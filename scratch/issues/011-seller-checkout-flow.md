# 011 — Seller checkout flow (cart → payment → celebration)

**Type:** AFK  
**Status:** open  
**Blocked by:** 002, 003

## What to build

TDD the **Seller**'s primary sale flow end-to-end against the real catalog and **Active Market Day** (not demo seed data). UI screens exist in the scaffold; this issue hardens behavior, persistence, and tests.

1. **Pick Items** — scrollable **Item** list with **+**; cart pinned at bottom with **− / +** per line, running total, **Checkout** (disabled when empty).
2. **Payment** — total; **Cash** or **Venmo/Zelle** (mutually exclusive). **Cash:** quick-tap bills, **− / +** $1 steppers, numeric input, **Change** shown. **Venmo/Zelle:** no extra input.
3. **Celebration** — "Sold!" + item count + total; **Fix** reloads the **Sale** into the cart for editing; tap elsewhere → **Home**.
4. Completing checkout creates a **Sale** on the **Active Market Day** with line-item price/cost snapshots.

Cost and **Sale number** stay admin-only — never on kid-facing screens.

## Acceptance criteria

- [ ] **Seller** can add/remove **Items** in the cart; total updates correctly
- [ ] **Checkout** disabled with empty cart; enabled with at least one line
- [ ] **Cash** and **Venmo/Zelle** are mutually exclusive; **Change** shown for cash
- [ ] Completing checkout persists a **Sale** with snapshotted line items on the **Active Market Day**
- [ ] **Celebration** shows item count and total (no **Sale number**)
- [ ] **Fix** reopens cart with the completed **Sale** loaded; re-checkout replaces the original **Sale**
- [ ] Retired **Items** do not appear in the picker
- [ ] Checkout blocked when no **Active Market Day** exists

## Blocked by

- [002 — Market Day lifecycle](./002-market-day-lifecycle.md)
- [003 — Admin Item catalog](./003-admin-item-catalog.md)
