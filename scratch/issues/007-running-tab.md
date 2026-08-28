# 007 — Running Tab: log sale + date-range export

**Type:** AFK  
**Status:** open  
**Blocked by:** 001, 003

## What to build

**Running Tab** is the admin-only bucket for misc **Sales** outside an **Active Market Day** (porch sales, one-offs). From the **Settings** tab, **Log a sale** launches the same checkout flow as the **Seller**, but **Sales** route to **Running Tab** (`marketDayId` null). Show a **Running Tab** summary section (total revenue, **Sale** count). **Export** uses a date-range picker; exported **Sales** are marked exported.

The **Seller** cannot add to **Running Tab** — only the **Admin**. Checkout for Running Tab uses the global non-archived catalog (not today’s Menu). **Inventory** tab is unchanged.

Running Tab UI can live below the Market Day dashboard when a day is active, or on the Settings empty state when no day is active — either way it stays on **Settings**, not **Inventory**.

## Acceptance criteria

- [ ] **Log a sale** on the Settings tab uses full checkout → **Running Tab**
- [ ] **Running Tab** summary visible on the Settings tab
- [ ] Date-range picker before export
- [ ] Export marks included **Sales** as exported
- [ ] **Seller** cannot log **Running Tab** **Sales**

## Blocked by

- [001 — First-run setup](./001-first-run-setup.md)
- [003 — Admin Item catalog](./003-admin-item-catalog.md)
