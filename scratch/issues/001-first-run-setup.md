# 001 — First-run setup: parental gate + first Item

**Type:** AFK  
**Status:** done  
**Blocked by:** None — can start immediately

## What to build

On first app launch, walk the admin through setup: set a numeric **parental gate** code, then add at least one **Item**. After setup, the **Seller** can browse the **Items** list on **Home**, but **Sell something!** stays disabled until an **Active Market Day** exists. Tapping the gear icon always requires the parental gate code before **Grown-up settings** opens.

Store the code in secure device storage (hashed). Do not seed demo Items or a demo Market Day on first launch — setup replaces the current auto-seed behavior.

## Acceptance criteria

- [x] First launch shows setup wizard (parental code → add first Item)
- [x] Gear icon is blocked by parental gate on every subsequent open
- [x] At least one non-retired Item is required before setup completes
- [x] **Home** shows **Items** menu; **Sell something!** disabled with kid-friendly message when no **Active Market Day**
- [x] Kid never sees cost fields during setup or on **Home**

## Blocked by

None — can start immediately
