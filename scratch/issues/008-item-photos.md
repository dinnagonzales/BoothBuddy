# 008 — Optional Item photos

**Type:** AFK  
**Status:** in progress (uncommitted WIP on `master`, Sep 18 2026)  
**Blocked by:** 003

## What to build / WIP

Owner can attach optional photo (library; camera via picker) when managing **Items**. No photo → emoji **icon**. Photos on Home + checkout. iOS permission strings in `app.json` (`expo-image-picker` plugin).

### In working tree

- Schema/query `photo_uri` · catalog create/update/list
- `lib/local-image.ts` — pick / persist / delete item photos
- `AdminItemCatalog` photo field + remove
- `Screen` / `IconTile` show photo when set
- Emoji picker modal + `IconInput` for icon choice
- Tests: `__tests__/item-photos-test.ts`
- Permission copy in `app.json`

## Acceptance criteria

- [x] Owner can add or replace photo on an **Item** *(WIP)*
- [x] Owner can remove photo (falls back to emoji) *(WIP)*
- [x] Photo shows on **Home** and checkout; cost still hidden *(WIP)*
- [x] Archived **Items** with photos behave like archived emoji **Items** *(WIP)*
- [ ] iOS photo/camera permission prompts verified on device
- [ ] WIP committed / green tests on CI

## Blocked by

- [003 — Owner Item catalog](./003-admin-item-catalog.md)
