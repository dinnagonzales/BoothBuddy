# 005 — Admin edit Sale

**Type:** AFK  
**Status:** open  
**Blocked by:** 004

## What to build

From the **Sale** list on the **Settings** tab, the **Admin** taps a **Sale** to open it. **PIN verification** (same 4-box pattern as the grown-up gate) is required before edit mode unlocks.

**Edit scope (PRD v0.2 — deliberately narrow):**

- **Remove order** — deletes the whole mis-logged transaction. *(shipped)*
- **Payment method** — switch Cash vs Venmo/Zelle. *(shipped)*
- **Name and notes (optional)** — free-text metadata for customer/tab labels and preorder or running-tab context. *(shipped)*
- **Edit quantity** — pencil icon per line item opens a stepper; **only one line item in edit mode at a time**. *(not yet shipped)*

Out of scope: adding items to an existing order, per-item delete-only, changing cash received, restructuring beyond quantity. If composition needs to change beyond quantity, remove the order and re-log from scratch.

Complements kid-facing **Edit this sale** on the **Celebration** overlay — this covers corrections discovered later in Settings. Name and notes set in admin edit are preserved if the kid re-logs the same sale via **Fix**.

If that **Market Day** (or **Running Tab** chunk) was already exported, flag the bucket as out of date with a **re-export recommended** notice after any edit.

## Acceptance criteria

- [x] Admin can open a **Sale** from the Settings dashboard list
- [ ] PIN required before edit mode unlocks
- [x] Admin can remove the whole **Sale**
- [x] Admin can change **Payment method**
- [x] Admin can add optional **name** and **notes** on a **Sale**
- [ ] Admin can change quantity on one line item at a time (stepper)
- [ ] Saved quantity edits re-snapshot price and cost on that line item
- [x] Dashboard totals update after edit or remove
- [x] Exported buckets show out-of-date / re-export warning after edit

## Blocked by

- [004 — Admin sales dashboard](./004-admin-sales-dashboard.md)
