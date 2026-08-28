# 004 — Admin sales dashboard (totals + Sale list)

**Type:** AFK  
**Status:** done  
**Blocked by:** 002

## What to build

The **Settings** tab (grown-up area, PIN-gated) shows a dashboard for the **Active Market Day** only: total revenue, **Item** count sold, breakdown by **Payment method** (Cash vs Venmo/Zelle), and **Sale** count. Below totals, a scrollable list of **Sales** for that day — each row shows **Sale number** (or optional **Sale name** when set), time, total, and payment method.

When no **Active Market Day**, Settings shows the “No market day yet” empty state with a **start form** (name + date) and a **Past Events** list of all closed days (newest first). Tapping a past event opens its admin dashboard (totals + sales, no menu). Closed-day **export** and **Reopen** live on that past-event screen — see [006](./006-export-market-day-csv.md).

Totals and **Sale numbers** are admin-only — not on the **Seller**'s **Home** or **Celebration** overlay. The master **Item** catalog is on the separate **Inventory** tab.

## Acceptance criteria

- [x] Dashboard shows total revenue and item count for the **Active Market Day**
- [x] Cash vs Venmo/Zelle totals shown separately
- [x] Sale list shows every **Sale** with **Sale number**, timestamp, total, payment method
- [x] Optional **Sale name** shown on list rows when set (falls back to **Sale number**)
- [x] No sales totals visible on **Home** or kid-facing screens
- [x] Empty state when no **Sales** yet (within an active day)

## Blocked by

- [002 — Market Day lifecycle](./002-market-day-lifecycle.md)
