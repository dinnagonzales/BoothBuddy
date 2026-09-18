# 005 — Owner edit Sale

**Type:** AFK  
**Status:** done (v1 scope)  
**Blocked by:** 004

## What shipped

From **Sales** / Events / Past Events / Preorders lists, owner opens a **Sale**. Area already Pass Code gated — no second per-sale PIN.

**Edit scope (PRD v0.2):**

- **Remove order** — delete whole mis-logged transaction
- **Payment method** — Cash vs Venmo/Zelle (+ amount paid / keep change)
- **Name, notes, complete date** — metadata; complete date required for preorders
- **Mark complete / Mark Delivered** — preorder pickup payment → moves to Sales

**Deferred (not v1):** line-item **quantity** edit — use remove + re-log (or staff **Fix** on celebration). See PRD.

Complements staff **Edit this sale** on Celebration. Post-export edits flag Market Day re-export.

## Acceptance criteria

- [x] Owner can open a **Sale** from dashboard / Sales / Preorders lists
- [x] ~~PIN before edit~~ — dropped; owner area already Pass Code gated
- [x] Owner can remove whole **Sale**
- [x] Owner can change **Payment method** (+ cash received / keep change)
- [x] Owner can set optional **name** / **notes**; **complete date** for preorders
- [x] ~~Quantity stepper~~ — deferred per PRD; remove + re-log
- [x] Dashboard totals update after edit or remove
- [x] Exported Market Days show out-of-date / re-export warning after edit
- [x] Preorder pickup payment + **Mark complete** / **Mark Delivered**

## Blocked by

- [004 — Owner sales dashboard](./004-admin-sales-dashboard.md)
