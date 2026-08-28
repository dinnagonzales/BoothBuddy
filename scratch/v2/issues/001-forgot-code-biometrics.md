# v2-001 — Forgot code: device auth → set new code (keep data)

**Type:** AFK  
**Status:** open  
**Blocked by:** v1 MVP (001–007) shipped

## Problem

v1 **Forgot your code?** erases all Items, Sales, and Market Days. That is correct for security but painful if the grown-up forgets the code mid-season with unreconciled sales still on device.

## Proposal

On the gear **parental gate** screen, offer a second path:

1. **Forgot your code?** (existing) → factory reset (unchanged).
2. **Use Face ID / device passcode** → prove you are the device owner → **set a new 4-digit code** without wiping SQLite.

Use [`expo-local-authentication`](https://docs.expo.dev/versions/latest/sdk/local-authentication/) (`authenticateAsync`). Fall back to factory reset when biometrics are unavailable (simulator, older devices).

## Acceptance criteria

- [ ] Tapping **Use Face ID / passcode** prompts system auth
- [ ] Successful auth opens the same code + confirm UI as first-run setup
- [ ] New code replaces the old hash in secure storage
- [ ] Items, Sales, and Market Days are **not** deleted
- [ ] Failed / cancelled auth returns to the gate with no changes
- [ ] Factory reset path still available and unchanged

## Notes

- App Store: document in review notes that parental gate recovery requires device owner authentication.
- Web dev: biometrics may be unavailable; keep factory reset only or stub with a dev-only bypass.

## Blocked by

- v1 MVP complete
