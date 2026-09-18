# 001 — First-run setup: Pass Code + first Item

**Type:** AFK  
**Status:** done  
**Blocked by:** None

## What shipped

On first launch: welcome → set numeric **Pass Code** → optional **owner profile** (business name / first name) → add at least one **Item**. After setup, **Staff** browses **Items** on **Home** and uses **Make a Sale** anytime. Gear always requires Pass Code (when gate enabled) before **Owner settings**.

Code stored hashed in secure storage. No demo seed data.

## Acceptance criteria

- [x] First launch shows setup wizard (Pass Code → optional profile → first Item)
- [x] Gear icon blocked by Pass Code on subsequent opens (when gate on)
- [x] At least one non-archived Item required before setup completes
- [x] **Home** shows **Items** menu; **Make a Sale** always available after setup
- [x] Staff never sees cost fields during setup or on **Home**
- [x] Home empty-state can launch **Add Item** into owner inventory flow

## Blocked by

None
