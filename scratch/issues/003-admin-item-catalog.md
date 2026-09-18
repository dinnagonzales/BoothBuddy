# 003 — Owner Item catalog (add, edit, archive)

**Type:** AFK  
**Status:** done  
**Blocked by:** 001

## What shipped

From **Owner settings → Inventory**: add/edit name, **icon** (emoji; optional photo → [008](./008-item-photos.md)), cost, price. **Archive** hides from Home/checkout; keeps history. **UnArchive** restores. Staff views update immediately. Cost owner-only.

Also: delete Item when never used in past sales.

## Acceptance criteria

- [x] Owner can add **Item** (icon, name, cost, price)
- [x] Owner can edit existing **Item**
- [x] Owner can archive — hidden from staff views, still in history
- [x] Owner can UnArchive
- [x] Archived **Items** cannot join new **Sales**
- [x] **Home** / checkout reflect catalog changes without restart

## Blocked by

- [001 — First-run setup](./001-first-run-setup.md)
