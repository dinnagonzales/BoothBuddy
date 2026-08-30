# v2-002 — Change parental code from grown-up settings

**Type:** AFK  
**Status:** done  
**Blocked by:** [v2-001](./001-forgot-code-biometrics.md) (optional — can ship with “enter current code” only)

## Problem

Once setup is done, there is no way to rotate the grown-up code without factory reset (v1) or biometrics recovery (v2-001).

## Proposal

From **Grown-up Settings** tab (already unlocked):

**Change Pass Code** → enter current code → new code + confirm → save hashed replacement.

## Acceptance criteria

- [x] Admin can change code while settings are unlocked
- [x] Requires current code **or** successful device auth *(current code only — device auth deferred to v2-001)*
- [x] New code must be 4 digits; confirm must match
- [x] Gear gate accepts new code on next open
- [x] Kid never sees this flow

## Blocked by

- v1 MVP complete
- Optional: v2-001 if using biometrics as alternate proof
