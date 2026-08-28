# 005 — Admin edit Sale

**Type:** AFK  
**Status:** open  
**Blocked by:** 004

## What to build

From the **Sale** list in **Grown-up settings**, the **Admin** can open any **Sale** and edit it: line **Items** (add/remove/change quantity), **Payment method**, and **Cash received**. Changed line **Items** re-snapshot the **Item**'s current price and cost at save time. If that **Market Day** (or **Running Tab** chunk) was already exported, flag the bucket as out of date with a **re-export recommended** notice.

Complements kid-facing **Fix** on the **Celebration** overlay — this covers corrections discovered later.

## Acceptance criteria

- [ ] Admin can open a **Sale** from the dashboard list
- [ ] Admin can change line items, payment method, and cash received
- [ ] Saved edits re-snapshot price and cost on changed line items
- [ ] Dashboard totals update after edit
- [ ] Exported buckets show out-of-date / re-export warning after edit

## Blocked by

- [004 — Admin sales dashboard](./004-admin-sales-dashboard.md)
