# v2-002 — Change parental code from grown-up settings

**Type:** AFK  
**Status:** open  
**Blocked by:** [v2-001](./001-forgot-code-biometrics.md) (optional — can ship with “enter current code” only)

## Problem

Once setup is done, there is no way to rotate the grown-up code without factory reset (v1) or biometrics recovery (v2-001).

## Proposal

From **Grown-up settings** (already unlocked):

**Change grown-up code** → enter current code (or device auth per v2-001) → new code + confirm → save hashed replacement.

## Acceptance criteria

- [ ] Admin can change code while settings are unlocked
- [ ] Requires current code **or** successful device auth
- [ ] New code must be 4 digits; confirm must match
- [ ] Gear gate accepts new code on next open
- [ ] Kid never sees this flow

## Blocked by

- v1 MVP complete
- Optional: v2-001 if using biometrics as alternate proof
