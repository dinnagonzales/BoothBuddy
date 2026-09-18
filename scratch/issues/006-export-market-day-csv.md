# 006 — Export Closed Market Day (CSV + share sheet)

**Type:** AFK  
**Status:** done  
**Blocked by:** 002, 004

## What shipped

Owner exports a **Closed Market Day** as CSV via share sheet. Rows: sale #, timestamps, Market Day name, line items (name/qty/price/cost), totals, profit, payment, cash received, change kept, customer name. Summary footer: Total / Gross / Profit (without tips), Tips total. Filename includes Market Day name.

Export locks **Reopen**. Post-export edits → re-export flag. UI on past-event detail (`Events → Past Events → day`).

## Acceptance criteria

- [x] Export for **Closed Market Day** with **Sales**
- [x] CSV → share sheet; opens in Excel
- [x] Rows include sale #, timestamps, items, totals, payment, cost/profit, customer name
- [x] **Reopen** disabled after export
- [x] Out-of-date flag if **Sales** edited post-export

## Blocked by

- [002 — Market Day lifecycle](./002-market-day-lifecycle.md)
- [004 — Owner sales dashboard](./004-admin-sales-dashboard.md)
