# 007 — Running Tab: off-day sales + preorders + date-range export

**Type:** AFK  
**Status:** open (near done — sale-level export marking left)  
**Blocked by:** 001, 003

## What shipped

**Running Tab** = misc **Sales** with no **Market Day** (`marketDayId` null). Completed off-day sales appear in **Sales** tab (all-time). No separate Running Tab section on Events.

### Off-day Make a Sale

No active day → **Make a Sale** uses global non-archived catalog. Optional name/notes above cart. Cash or Venmo/Zelle → Running Tab.

### + Pre-order

Always Running Tab. Required name, notes, complete date. Payment at create = **Pay on pickup** only. **Preorders** tab: Prepare summary, Overdue/Upcoming, printable export. Pickup: record Cash/Venmo/Zelle → **Mark complete**; paid list supports **Mark Delivered**. Celebration dismiss → Home.

### Sales tab export

Date-range pickers + **Export sales as CSV** share sheet — **shipped**.  
**Gap:** `shareSalesCsv` does **not** yet set `sales.exported_at` / re-export flags (column exists; write path missing). PRD/CONTEXT still require marking.

## Acceptance criteria

- [x] **Make a Sale** with no active day → Running Tab + optional name/notes
- [x] **+ Pre-order** → Running Tab; name/notes/complete date required
- [x] **+ Pre-order** during active day still → Running Tab
- [x] **Preorders** tab: Prepare, Overdue/Upcoming, printable export
- [x] Pickup payment + **Mark complete** / **Mark Delivered** → Sales
- [x] Off-day **Sales** in **Sales** tab (all-time; no Market Day name on row)
- [x] Date-range picker on **Sales** tab before export
- [ ] Export marks included **Sales** as exported (`exported_at` + edit re-flag)
- [x] No **Running Tab** summary on Events/Settings
- [x] Celebration dismiss after off-day/preorder → Home

## Remaining

1. On date-range CSV export, stamp `exported_at` on included completed sales  
2. Editing an exported Running Tab sale should recommend re-export (parity with Market Day flag)

## Blocked by

- [001 — First-run setup](./001-first-run-setup.md)
- [003 — Owner Item catalog](./003-admin-item-catalog.md)
