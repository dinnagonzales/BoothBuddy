# 010 — App Store submission

**Type:** HITL  
**Status:** open  
**Blocked by:** 001–007 (007 near done — export marking gap only)

## What to build

Ship **Booth Buddy** as standalone iOS app (not Expo Go): Apple Developer enrollment, EAS production build, TestFlight on family iPad, privacy policy URL, App Store metadata + screenshots, submit for review.

Original target was ~Sep 8–10 for Sep 18 market — **date passed**; still ship when demo-ready.

**Category:** Business (not Kids). Review notes: Pass Code gate; Staff never sees cost/totals; local-only, no login.

## Privacy policy (draft ready)

- **Source:** [docs/privacy-policy.md](../../docs/privacy-policy.md)
- **Publishable page:** [web/privacy.html](../../web/privacy.html)
- **Before submit:** replace `CONTACT_EMAIL`; host `web/privacy.html`; paste URL into App Store Connect
- **App Privacy labels (v1):** likely **Data Not Collected** — see notes in privacy-policy.md

## Build gaps (repo)

- [ ] `ios.bundleIdentifier` in `market-day/app.json`
- [ ] `eas.json` / EAS project configure
- [ ] If landing 008: camera/photo strings already in `app.json` plugin — verify on device

## Acceptance criteria

- [ ] Apple Developer Program active ($99)
- [ ] TestFlight build runs on family iPad without Expo Go
- [ ] Privacy policy published + linked in App Store Connect
- [ ] Screenshots + description submitted
- [ ] App approved or rejection addressed

## Blocked by

- [001](001-first-run-setup.md)–[007](007-running-tab.md) demo-ready (finish 007 export marking)
- Soft: [009](009-visual-polish.md) iPad sign-off before store screenshots
