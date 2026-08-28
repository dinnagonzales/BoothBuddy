# 008 — Optional Item photos

**Type:** AFK  
**Status:** open  
**Blocked by:** 003

## What to build

When managing **Items**, the **Admin** can optionally attach a photo (camera or library). If no photo, emoji icon is used. Photos appear on **Home** **Items** menu and checkout rows so customers can see what a 3D print looks like.

Include required iOS permission strings in app config.

## Acceptance criteria

- [ ] Admin can add or replace photo on an **Item**
- [ ] Admin can remove photo (falls back to emoji)
- [ ] Photo shows on **Home** and checkout; cost still hidden from **Seller**
- [ ] Retired **Items** with photos behave like retired emoji **Items**
- [ ] iOS photo/camera permission prompts work on device

## Blocked by

- [003 — Admin Item catalog](./003-admin-item-catalog.md)
