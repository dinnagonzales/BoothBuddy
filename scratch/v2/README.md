# Market Day — v2 backlog

Deferred work that is **out of MVP scope** but worth keeping. Not blocked on v1 shipping; pull in after 001–010 are demo-ready (or when pain shows up in real use).

**Source:** parental gate design session, Aug 28 2026

## v1 behavior (for context)

| Situation | v1 behavior |
|-----------|-------------|
| No parental code on device | Treat as brand-new user: wipe shop data, full setup wizard |
| Wrong code at gear | Reject; try again |
| Forgot code | **Forgot your code?** → erase everything → setup again (same as delete app) |
| Know the code | Unlock grown-up settings |

The code is stored as a **SHA-256 hash** in secure storage (Keychain / Keystore; `localStorage` on web dev only). There is no recovery of the original digits.

## v2 issues

| # | Title | Why v2 |
|---|-------|--------|
| [001](issues/001-forgot-code-biometrics.md) | Forgot code: device auth → set new code (keep data) | Needs `expo-local-authentication`, UX + App Store review notes |
| [002](issues/002-change-parental-code.md) | Change parental code from grown-up settings | Only useful once admin area is fuller; requires current code or biometrics |

## Explicit non-goals (still)

- Cloud accounts / email recovery
- Kid-accessible reset (defeats the gate)
- Storing or displaying the plaintext code
