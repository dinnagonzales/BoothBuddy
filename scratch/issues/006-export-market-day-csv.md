# 006 — Export Closed Market Day (CSV + share sheet)

**Type:** AFK  
**Status:** open  
**Blocked by:** 002, 004

## What to build

The **Admin** can **export** a **Closed Market Day** as CSV and hand it off via the native share sheet (Mail, AirDrop, Files). CSV includes **Sale number**, date/time, **Market Day** name, line item names/qty/price/cost, **Sale** total, **Payment method**, **Cash received**, and profit. Filename includes the **Market Day** name.

**Export** locks **undo close** for that **Market Day**. Edits after export flag re-export (see 005).

## Acceptance criteria

- [ ] Export button available for **Closed Market Day** with **Sales**
- [ ] CSV opens in share sheet; opens cleanly in Excel
- [ ] Rows include **Sale number**, timestamps, items, totals, payment, cost/profit
- [ ] **Undo close** disabled after export
- [ ] Out-of-date flag shown if **Sales** edited post-export

## Blocked by

- [002 — Market Day lifecycle](./002-market-day-lifecycle.md)
- [004 — Admin sales dashboard](./004-admin-sales-dashboard.md)
