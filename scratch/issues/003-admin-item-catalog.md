# 003 — Admin Item catalog (add, edit, retire)

**Type:** AFK  
**Status:** open  
**Blocked by:** 001

## What to build

From **Grown-up settings**, the **Admin** manages the **Item** catalog: add and edit name, emoji icon, cost, and price. **Retire** hides an **Item** from **Home** and checkout but preserves it in past **Sales** and exports. The **Seller**'s **Items** menu and checkout picker update immediately when Items change.

Cost is admin-only and never shown on **Home** or in the sell flow.

## Acceptance criteria

- [ ] Admin can add a new **Item** (emoji icon, name, cost, price)
- [ ] Admin can edit an existing **Item**
- [ ] Admin can retire an **Item** — hidden from kid views, still in history
- [ ] Retired **Items** cannot be added to new **Sales**
- [ ] **Home** and checkout reflect catalog changes without app restart

## Blocked by

- [001 — First-run setup: parental gate + first Item](./001-first-run-setup.md)
