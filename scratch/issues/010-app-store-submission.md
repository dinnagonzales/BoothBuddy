# 010 — App Store submission

**Type:** HITL  
**Status:** open  
**Blocked by:** 001–007

## What to build

Ship Market Day as a standalone iOS app (not Expo Go): Apple Developer enrollment, EAS production build, TestFlight on family iPad, privacy policy URL, App Store metadata and screenshots, submit for review by ~Sep 8–10 for Sep 18 market.

List under **Business** category (not Kids Category). Review notes should explain parental gate and that **Seller** never sees cost or totals.

## Privacy policy (draft ready)

- **Source:** [docs/privacy-policy.md](../../docs/privacy-policy.md)
- **Publishable page:** [web/privacy.html](../../web/privacy.html)
- **Before submit:** replace `CONTACT_EMAIL` in both files; host `web/privacy.html` (GitHub Pages, help site, or static host); paste public URL into App Store Connect → App Privacy → Privacy Policy URL
- **App Privacy labels (v1):** likely **Data Not Collected** — see developer notes at bottom of `docs/privacy-policy.md`


## Acceptance criteria

- [ ] Apple Developer Program active ($99)
- [ ] TestFlight build runs on family iPad without Expo Go
- [ ] Privacy policy published and linked in App Store Connect ([draft ready](../../docs/privacy-policy.md))
- [ ] Screenshots + description submitted
- [ ] App approved or rejection addressed before Sep 18

## Blocked by

- [001](001-first-run-setup.md) through [007](007-running-tab.md) — core MVP demo-ready
