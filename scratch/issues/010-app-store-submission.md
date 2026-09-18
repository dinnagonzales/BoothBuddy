# 010 — App Store submission

**Type:** HITL  
**Status:** open (Apple enrolled — membership **Pending**; ASC not enabled yet)  
**Blocked by:** Apple Active + 001–007 demo-ready (007 near done)

## Jump here when Active

→ **[docs/testflight-when-apple-active.md](../../docs/testflight-when-apple-active.md)**  
IDs, ASC create steps, `eas build` command, TestFlight install.

## What to build

Ship **Booth Buddy** as standalone iOS app (not Expo Go): EAS production build, TestFlight on family iPad, privacy policy URL, App Store metadata + screenshots, submit for review (or stay TestFlight-only).

**Category:** Business (not Kids). Review notes: Pass Code gate; Staff never sees cost/totals; local-only, no login.

## Privacy policy (draft ready)

- **Source:** [docs/privacy-policy.md](../../docs/privacy-policy.md)
- **Publishable page:** [web/privacy.html](../../web/privacy.html)
- **Before public submit:** replace `CONTACT_EMAIL`; host page; paste URL into ASC
- **App Privacy labels (v1):** likely **Data Not Collected**

## Build gaps (repo)

- [x] `ios.bundleIdentifier` → `com.dinnagonzales.boothbuddy`
- [x] `eas.json` + Expo `@titadinna/market-day`
- [x] Apple Developer enrolled ($99) — waiting for **Active** / ASC access
- [ ] ASC app record + first `eas build --platform ios --profile production --auto-submit`
- [ ] Camera/photo prompts verified on device

## Acceptance criteria

- [ ] Apple Developer Program **Active** (not Pending)
- [ ] TestFlight build runs on family iPad without Expo Go
- [ ] Privacy policy published + linked (before public store; optional for internal TF)
- [ ] Screenshots + description submitted (public store only)
- [ ] App approved or rejection addressed — or stay private on TestFlight

## Blocked by

- Apple membership Active + ASC enabled
- Soft: [007](007-running-tab.md) export marking; [009](009-visual-polish.md) iPad sign-off before store screenshots
