# App Store Submission Checklist — Booth Buddy

> **Membership Pending?** Open **[testflight-when-apple-active.md](./testflight-when-apple-active.md)** when Apple flips to Active — IDs + step-by-step TestFlight.

**Target:** TestFlight on family iPad → App Store (when ready).

**Category:** Business (not Kids Category). Review notes: Pass Code gate on gear icon; Staff never sees cost or totals; local-only data, no login/server.

---

## Before submit — app work still open

Issue [010](../scratch/issues/010-app-store-submission.md) blocked by **001–007** (007 near done).

| Issue | Status | Remaining |
|-------|--------|-----------|
| [007 — Running Tab](../scratch/issues/007-running-tab.md) | Near done | Stamp `sales.exported_at` on date-range export + re-export flag |
| [008 — Item photos](../scratch/issues/008-item-photos.md) | Shipped in repo | Device permission smoke test |
| [009 — Visual polish](../scratch/issues/009-visual-polish.md) | Code shipped | iPad visual sign-off |
| [005 — Owner edit sale](../scratch/issues/005-admin-edit-sale.md) | **done** | Quantity edit deferred per PRD |

**Not blockers for v1 store submit:** [012 help site](../scratch/issues/012-web-help-site-content.md).

---

## 1. Accounts

- [x] Enroll in [Apple Developer Program](https://developer.apple.com/programs/enroll/) ($99) — **paid Sep 18 2026; membership Pending ASC enable**
- [x] [Expo](https://expo.dev) account (`titadinna`)
- [x] EAS CLI installed; project linked
- [ ] Membership **Active** + App Store Connect accessible → then follow [testflight-when-apple-active.md](./testflight-when-apple-active.md)

---

## 2. iOS build config

- [x] `ios.bundleIdentifier` → `com.dinnagonzales.boothbuddy`
- [x] `android.package` (same)
- [x] `market-day/eas.json`
- [x] Expo project `@titadinna/market-day`
- [ ] First production build + TestFlight — see [testflight-when-apple-active.md](./testflight-when-apple-active.md)
- [ ] Item photos (008): verify camera/photo prompts on device

---

## 3. Privacy policy

Draft ready — [docs/privacy-policy.md](./privacy-policy.md), publishable page [web/privacy.html](../web/privacy.html).

- [ ] Replace `CONTACT_EMAIL` in both files
- [ ] Host `web/privacy.html` (GitHub Pages, help site, or static host)
- [ ] App Store Connect → App Privacy → Privacy Policy URL
- [ ] App Privacy questionnaire: **Data Not Collected** (see developer notes in `privacy-policy.md`)

---

## 4. App Store Connect listing

- [ ] Create app record (name **Booth Buddy**, bundle ID, SKU `boothbuddy-001`)
- [ ] Category: **Business**
- [ ] Screenshots (iPad required — `supportsTablet: true`; add iPhone if listing as universal)
- [ ] Description, keywords, support URL
- [ ] Review notes:
  - Pass Code gate: gear → pass code before owner settings
  - Staff flow never shows cost or profit totals
  - All data stays on device; no accounts or backend

---

## 5. TestFlight → review

- [ ] Build + submit per [testflight-when-apple-active.md](./testflight-when-apple-active.md)
- [ ] Install on family iPad via TestFlight — runs **without Expo Go**
- [ ] (Later) Submit for App Store review — or stay TestFlight-only / unlisted

---

## Already done

- Core MVP: setup, market days, catalog, sales dashboard, CSV export, menu, owner edit, Running Tab UI, preorders (001–006, 011, most of 007, 005)
- Rebrand Booth Buddy + Owner/Staff copy + brand palette
- App name, icon, splash in `market-day/assets/`
- Privacy policy draft + HTML page
- ADR: Business category, local-only, no analytics/ads
- Change Pass Code in Settings (was v2-002)
- Item photo permission strings already in `app.json`
- Bundle ID + EAS project linked

---

## Suggested order (now)

1. Wait for Apple membership **Active**
2. [testflight-when-apple-active.md](./testflight-when-apple-active.md) → ASC app + first build
3. Finish 007 leftover (sale export marking) when convenient
4. Privacy policy host + store listing when going public

---

## References

- **[TestFlight when Active](./testflight-when-apple-active.md)** ← start here after approval
- [Issue 010](../scratch/issues/010-app-store-submission.md)
- [Expo — TestFlight](https://docs.expo.dev/submit/testflight/)
- [App Store Release Checklist (HTML)](../reference/app-store-release-checklist.html)
- [Lesson 0002 — Releasing on the App Store](../lessons/0002-app-store-release.html)
