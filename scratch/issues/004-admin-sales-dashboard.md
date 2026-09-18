# 004 — Owner sales dashboard (totals + Sale list)

**Type:** AFK  
**Status:** done  
**Blocked by:** 002

## What shipped

**Events** tab (Pass Code gated): dashboard for **Active Market Day** — revenue, item count sold, Cash vs Venmo/Zelle (Cash includes tips subline when kept change), sale count, scrollable **Sales** list (sale # / optional name, time, total, payment).

No active day → empty state with start form + **Past Events**. Past event detail = totals + sales + export/reopen. Catalog lives on **Inventory**. Totals not on staff Home/Celebration.

## Acceptance criteria

- [x] Dashboard shows total revenue + item count for **Active Market Day**
- [x] Cash vs Venmo/Zelle separate; tips breakdown under Cash when applicable
- [x] Sale list: every **Sale** with #, timestamp, total, payment
- [x] Optional **Sale name** on rows when set
- [x] No sales totals on **Home** / staff screens
- [x] Empty state when no **Sales** yet (within active day)

## Blocked by

- [002 — Market Day lifecycle](./002-market-day-lifecycle.md)
