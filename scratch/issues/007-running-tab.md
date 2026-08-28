# 007 — Running Tab: Quick Sale + date-range export

**Type:** AFK  
**Status:** open  
**Blocked by:** 001, 003

## What to build

**Running Tab** is the bucket for misc **Sales** outside an **Active Market Day** (porch sales, one-offs). **Sales** save with no **Market Day** (`marketDayId` null). There is no separate **Running Tab** section on **Settings** — off-day **Sales** appear in the **Sales** tab alongside **Market Day** **Sales** (all-time totals and list). **Export** for off-day **Sales** uses a date-range picker on the **Sales** tab; exported **Sales** are marked exported.

### Quick Sale

A **+** button next to the ⚙️ gear on **Home** launches **Quick Sale** — off-day checkout routed to **Running Tab** (`marketDayId` null). Same cart flow as the **Seller** — pick **Items**, cart with **− / +**, payment, celebration — but with optional **Sale name** and **Sale notes** fields above the cart.

Available whether or not an **Active Market Day** is running (porch sale during a fair still goes to **Running Tab**, not today's day). Checkout uses the global non-archived catalog (not today's **Menu**). **Inventory** tab is unchanged. After **Celebration**, dismiss returns to **Home** (same as the seller flow).

## Acceptance criteria

- [ ] **+** next to gear on **Home** → **Quick Sale** checkout → **Running Tab** (`marketDayId` null)
- [ ] Admin checkout for **Running Tab** shows optional **Sale name** and **Sale notes** above the cart
- [ ] Off-day **Sales** appear in the **Sales** tab (all-time stats and list; no **Market Day** name on row)
- [ ] Date-range picker on **Sales** tab before off-day export
- [ ] Export marks included **Sales** as exported
- [ ] No **Running Tab** summary on **Settings**
- [ ] Dismissing **Celebration** after **Quick Sale** returns to **Home**

## Blocked by

- [001 — First-run setup](./001-first-run-setup.md)
- [003 — Admin Item catalog](./003-admin-item-catalog.md)
