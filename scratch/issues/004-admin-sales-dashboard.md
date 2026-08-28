# 004 — Admin sales dashboard (totals + Sale list)

**Type:** AFK  
**Status:** open  
**Blocked by:** 002

## What to build

**Grown-up settings** shows a dashboard for the **Active** or most recent **Market Day**: total revenue, **Item** count sold, and breakdown by **Payment method** (Cash vs Venmo/Zelle). Below totals, a scrollable list of **Sales** for that **Market Day**, each showing **Sale number**, time, total, and payment method.

Totals and **Sale numbers** are admin-only — not on the **Seller**'s **Home** or **Celebration** overlay.

## Acceptance criteria

- [ ] Dashboard shows total revenue and item count for current/recent **Market Day**
- [ ] Cash vs Venmo/Zelle totals shown separately
- [ ] Sale list shows every **Sale** with **Sale number**, timestamp, total, payment method
- [ ] No sales totals visible on **Home** or kid-facing screens
- [ ] Empty state when no **Sales** yet

## Blocked by

- [002 — Market Day lifecycle](./002-market-day-lifecycle.md)
