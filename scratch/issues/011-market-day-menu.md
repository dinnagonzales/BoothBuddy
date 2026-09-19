# 011 — Market Day Menu (default all Items, remove, sold out, reorder)

**Type:** AFK  
**Status:** done  
**Blocked by:** 002, 003

## What shipped

Each **Market Day** has a **Menu**. On start, auto-populates with every non-archived **Item** in Inventory A–Z order. **Events → Today's Menu** (active day only): **drag to reorder**, **remove**, or **sold out**. Remove hides from Home/checkout for that day; sold out stays visible but blocked in checkout (and keeps its place in the order). Mutually exclusive; sold out reversible.

Custom order applies to Home and Make a Sale for the active day. Mid-day joiners (new Inventory items, restores) append at the end. Reopen restores Menu snapshot including order; a brand-new Market Day resets to Inventory A–Z. Closed Menu frozen (no closed-day menu UI). Running Tab ignores Menu.

## Acceptance criteria

- [x] Start Market Day auto-populates Menu
- [x] Today's Menu in Events during active day
- [x] Remove → hidden from Home/checkout
- [x] Sold out → visible with indicator, blocked in checkout
- [x] Sold out reversible; remove/sold out mutually exclusive
- [x] New Items auto-join; archive auto-removes
- [x] Reopen restores Menu exactly
- [x] Closed Menu persisted as snapshot
- [x] Running Tab ignores Menu
- [x] Home/checkout reflect Menu changes without restart
- [x] Owner can drag-reorder Today's Menu; Home / Make a Sale follow
- [x] New Market Day seeds A–Z; mid-day joiners append; sold out keeps position

## Blocked by

- [002 — Market Day lifecycle](./002-market-day-lifecycle.md)
- [003 — Owner Item catalog](./003-admin-item-catalog.md)
