# App Store Submission Checklist — Booth Buddy

**Target:** TestFlight on family iPad → App Store. Original ~Sep 8–10 / Sep 18 fair window **passed** — ship when ready.

**Category:** Business (not Kids Category). Review notes: Pass Code gate on gear icon; Staff never sees cost or totals; local-only data, no login/server.

---

## Before submit — app work still open

Issue [010](../scratch/issues/010-app-store-submission.md) blocked by **001–007** (007 near done).

| Issue | Status | Remaining |
|-------|--------|-----------|
| [007 — Running Tab](../scratch/issues/007-running-tab.md) | Near done | Stamp `sales.exported_at` on date-range export + re-export flag |
| [008 — Item photos](../scratch/issues/008-item-photos.md) | WIP uncommitted | Commit + device permission check |
| [009 — Visual polish](../scratch/issues/009-visual-polish.md) | Code shipped | iPad visual sign-off |
| [005 — Owner edit sale](../scratch/issues/005-admin-edit-sale.md) | **done** | Quantity edit deferred per PRD |

**Not blockers for v1 store submit:** [012 help site](../scratch/issues/012-web-help-site-content.md).

---

## 1. Accounts (start today)

- [ ] Enroll in [Apple Developer Program](https://developer.apple.com/programs/enroll/) ($99/yr) — legal name must match ID exactly
- [ ] Create [Expo](https://expo.dev) account
- [ ] Install EAS CLI: `npm install -g eas-cli`

---

## 2. iOS build config

Not set up yet in repo (`bundleIdentifier` missing, no `eas.json`).

- [ ] Add `ios.bundleIdentifier` to `market-day/app.json` (e.g. `com.yourname.boothbuddy`)
- [ ] In `market-day/`: `eas build:configure`
- [ ] First production build: `eas build --platform ios --profile production`
- [ ] If shipping item photos (008): permission strings already in `app.json` — verify prompts on device

---

## 3. Privacy policy

Draft ready — [docs/privacy-policy.md](./privacy-policy.md), publishable page [web/privacy.html](../web/privacy.html).

- [ ] Replace `CONTACT_EMAIL` in both files
- [ ] Host `web/privacy.html` (GitHub Pages, help site, or static host)
- [ ] App Store Connect → App Privacy → Privacy Policy URL
- [ ] App Privacy questionnaire: **Data Not Collected** (see developer notes in `privacy-policy.md`)

---

## 4. App Store Connect listing

- [ ] Create app record (name **Booth Buddy**, bundle ID, SKU)
- [ ] Category: **Business**
- [ ] Screenshots (iPad required — `supportsTablet: true`; add iPhone if listing as universal)
- [ ] Description, keywords, support URL
- [ ] Review notes:
  - Pass Code gate: gear → pass code before owner settings
  - Staff flow never shows cost or profit totals
  - All data stays on device; no accounts or backend

---

## 5. TestFlight → review

- [ ] `eas submit --platform ios --latest` (or submit from EAS dashboard)
- [ ] Install on family iPad via TestFlight — runs **without Expo Go**
- [ ] Submit for App Store review (~Sep 8–10; allow 2–5 days + buffer for one rejection)

---

## Already done

- Core MVP: setup, market days, catalog, sales dashboard, CSV export, menu, owner edit, Running Tab UI, preorders (001–006, 011, most of 007, 005)
- Rebrand Booth Buddy + Owner/Staff copy + brand palette
- App name, icon, splash in `market-day/assets/`
- Privacy policy draft + HTML page
- ADR: Business category, local-only, no analytics/ads
- Change Pass Code in Settings (was v2-002)
- Item photo permission strings already in `app.json` (008 WIP)

---

## Suggested order

1. Enroll Apple Developer (blocks everything else)
2. Finish issue 007 leftover (sale export marking)
3. Land/commit 008 photos WIP (optional for first TestFlight)
4. `bundleIdentifier` + `eas build:configure` + first iOS build
5. Publish privacy policy + TestFlight on iPad
6. Store listing + submit for review

---

## References

- [Issue 010](../scratch/issues/010-app-store-submission.md)
- [Expo — Submit to Apple App Store](https://docs.expo.dev/submit/ios/)
- [App Store Release Checklist (HTML)](../reference/app-store-release-checklist.html)
- [Lesson 0002 — Releasing on the App Store](../lessons/0002-app-store-release.html)
