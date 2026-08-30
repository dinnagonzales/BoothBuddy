# 006 — Export Closed Market Day (CSV + share sheet)

**Type:** AFK  
**Status:** done  
**Blocked by:** 002, 004

## What to build

The **Admin** can **export** a **Closed Market Day** as CSV and hand it off via the native share sheet (Mail, AirDrop, Files). CSV includes **Sale number**, date/time, **Market Day** name, line item names/qty/price/cost, line total, line profit, **Sale** total, **Payment method**, **Cash received**, **Change kept** (when the seller checked **Keep Change?**), **Customer name** (optional sale name, when set), and a summary footer: **Total (without tips)**, **Gross (without tips)**, **Profit (without tips)**, **Tips total**. Filename includes the **Market Day** name.

**Export** locks **Reopen** for that **Market Day**. Edits after export flag re-export (see [005](./005-admin-edit-sale.md)).

Because PRD v0.2 hides the sales dashboard when no **Active Market Day**, export UI lives on the **past-event detail** screen (`Settings → Past Events → tap a day`). **Inventory** tab is not involved.

## Acceptance criteria

- [x] Export button available for **Closed Market Day** with **Sales**
- [x] CSV opens in share sheet; opens cleanly in Excel
- [x] Rows include **Sale number**, timestamps, items, totals, payment, cost/profit, **Customer name** when set
- [x] **Reopen** disabled after export
- [x] Out-of-date flag shown if **Sales** edited post-export

## Blocked by

- [002 — Market Day lifecycle](./002-market-day-lifecycle.md)
- [004 — Admin sales dashboard](./004-admin-sales-dashboard.md)
