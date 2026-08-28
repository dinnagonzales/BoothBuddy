# 005 — Admin edit Sale

**Type:** AFK  
**Status:** open  
**Blocked by:** 004

## What to build

From the **Sale** list on the **Settings** tab, the **Admin** taps a **Sale** to open it. **PIN verification** (same 4-box pattern as the grown-up gate) is required before edit mode unlocks.

**Edit scope (PRD v0.2 — deliberately narrow):**

- **Remove order** — deletes the whole mis-logged transaction.
- **Edit quantity** — pencil icon per line item opens a stepper; **only one line item in edit mode at a time**.

Out of scope: adding items to an existing order, per-item delete-only, changing payment method or cash received, restructuring beyond quantity. If composition needs to change beyond quantity, remove the order and re-log from scratch.

Complements kid-facing **Edit this sale** on the **Celebration** overlay — this covers corrections discovered later in Settings.

If that **Market Day** (or **Running Tab** chunk) was already exported, flag the bucket as out of date with a **re-export recommended** notice after any edit.

## Acceptance criteria

- [ ] Admin can open a **Sale** from the Settings dashboard list
- [ ] PIN required before edit mode unlocks
- [ ] Admin can remove the whole **Sale**
- [ ] Admin can change quantity on one line item at a time (stepper)
- [ ] Saved quantity edits re-snapshot price and cost on that line item
- [ ] Dashboard totals update after edit or remove
- [ ] Exported buckets show out-of-date / re-export warning after edit

## Blocked by

- [004 — Admin sales dashboard](./004-admin-sales-dashboard.md)
