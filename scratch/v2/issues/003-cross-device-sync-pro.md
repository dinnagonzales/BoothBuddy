# v2-003 — Cross-device sync (Pro)

**Type:** AFK + HITL  
**Tier:** Pro  
**Status:** open  
**Blocked by:** v1 MVP (001–010) shipped; App Store standalone build (010)

## Problem

v1 is **local-first**: one SQLite database per device. A family may want the same Items, Market Days, and Sales on both an **iPad at the booth** and an **iPhone** in a pocket — without manual CSV shuffling. Login alone does not solve this; **sync** does.

## Proposal

**Market Day Pro** unlocks **Sign in with Apple** and **cloud sync** so the shop stays consistent across the owner’s iPhone and iPad.

Rough shape (pick one stack during design — do not commit in this issue):

1. **Sign in with Apple** — identity only; no kid-facing login; seller flow unchanged.
2. **Sync layer** — replicate Items, Market Days, Sales, and settings to a backend or Apple sync surface (CloudKit vs hosted DB TBD).
3. **Offline-first** — booth sales must complete with no signal; sync when online.
4. **Conflict rules** — document how concurrent edits resolve (e.g. sale numbers, two devices logging at once).

Free tier stays **single-device, local SQLite, CSV export** (current v1 behavior).

## Acceptance criteria

- [ ] Pro subscriber can sign in with Apple on iPhone and iPad
- [ ] Same catalog and sales history appear on both devices after sync
- [ ] Seller checkout works offline; changes upload when connectivity returns
- [ ] Parental gate remains device-local or synced securely (design decision recorded)
- [ ] Free users see upgrade path; no account required for v1-style single-device use
- [ ] App Store: Pro IAP or subscription wired; review notes explain sync + parental gate

## Non-goals (this issue)

- Android
- Multi-vendor / multi-shop accounts
- Kid login or shared family Apple IDs as a product feature
- Replacing CSV export for free tier

## Notes

- v1 PRD explicitly deferred **user accounts / login**; this is the intentional v2 Pro upsell.
- Hardest work is **sync semantics**, not Sign in with Apple — budget weeks, not days.
- Revisit [ADR 0001](../../docs/adr/0001-expo-local-first-stack.md) before implementation; may need a follow-on ADR for sync architecture.

## Blocked by

- v1 MVP complete
- [010 — App Store submission](../../issues/010-app-store-submission.md) (standalone build + IAP capability)
