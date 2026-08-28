# 003 — Admin Item catalog (add, edit, archive)

**Type:** AFK  
**Status:** done  
**Blocked by:** 001

## What to build

From **Grown-up settings**, the **Admin** manages the **Item** catalog: add and edit name, emoji icon, cost, and price. **Archive** hides an **Item** from **Home** and checkout but preserves it in past **Sales** and exports. **UnArchive** restores it. The **Seller**'s **Items** menu and checkout picker update immediately when Items change.

Cost is admin-only and never shown on **Home** or in the sell flow.

## Acceptance criteria

- [x] Admin can add a new **Item** (emoji icon, name, cost, price)
- [x] Admin can edit an existing **Item**
- [x] Admin can archive an **Item** — hidden from kid views, still in history
- [x] Admin can UnArchive an **Item** — visible to seller again
- [x] Archived **Items** cannot be added to new **Sales**
- [x] **Home** and checkout reflect catalog changes without app restart

## Blocked by

- [001 — First-run setup: parental gate + first Item](./001-first-run-setup.md)
