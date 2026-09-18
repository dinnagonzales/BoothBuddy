# v2 backlog — Booth Buddy

Deferred work **out of MVP scope**. Pull in after 001–010 demo-ready (or when pain shows up).

**Source:** Pass Code design session Aug 28 2026; cross-device sync discussion Aug 28 2026

## v1 behavior (context)

| Situation | v1 behavior |
|-----------|-------------|
| No Pass Code on device | Brand-new user: wipe shop data, full setup |
| Wrong code at gear | Reject; try again |
| Forgot code | **Forgot Pass Code?** → erase everything → setup again |
| Know the code | Unlock owner settings |
| Change code | Done in Settings (current code) — [v2-002](issues/002-change-parental-code.md) shipped into v1 |

Code stored as **SHA-256** hash in secure storage. No recovery of original digits.

## v2 issues

| # | Title | Status | Why v2 |
|---|-------|--------|--------|
| [001](issues/001-forgot-code-biometrics.md) | Forgot code: device auth → set new code (keep data) | open | Needs `expo-local-authentication`, App Store notes |
| [002](issues/002-change-parental-code.md) | Change Pass Code from Settings | **done** | Shipped with Settings tab |
| [003](issues/003-cross-device-sync-pro.md) | **Pro:** Sign in with Apple + iPhone/iPad sync | open | Local-only v1; sync + IAP post-fair |

## Tiers (sketch)

| Tier | Devices | Sync | Login |
|------|---------|------|-------|
| **Free (v1)** | One device | None — local SQLite + CSV | Pass Code only |
| **Pro (v2)** | iPhone + iPad (same Apple ID) | Cloud sync when online | Sign in with Apple (owner) |

## Explicit non-goals (still)

- Email/password accounts or email recovery
- Staff-accessible reset (defeats the gate)
- Storing or displaying plaintext Pass Code
