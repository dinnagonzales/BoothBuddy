# 001 — First-run setup: Pass Code + Home checklist

**Type:** AFK  
**Status:** done  
**Blocked by:** None

## What shipped

On first launch: **Welcome to Booth Buddy!** (splash + shop/profile) → set numeric **Pass Code** → success → **Home**. Adding the first **Item** (and optional payment/logo) happens on Home via **Get your shop ready**. After the required first item, **Hide** dismisses that checklist forever. Idle Home (no Market Day) always shows **Start Market Day**, **Update Inventory**, and **Go to Sales**.

Code stored hashed in secure storage. No demo seed data. Pass Code gate starts unlocked; owner locks from the header when leaving.

## Acceptance criteria

- [x] First launch shows setup wizard (Welcome → profile → Pass Code → success)
- [x] Gear unlocked after setup; Pass Code only after lock-on-exit
- [x] First Item required on Home checklist before selling (not inside the Pass Code wizard)
- [x] **Home** shows **Items**; **Make a Sale** when inventory exists
- [x] Staff never sees cost fields during setup or on **Home**
- [x] Home empty-state / checklist can launch **Add Item** into owner inventory flow

## Blocked by

None
