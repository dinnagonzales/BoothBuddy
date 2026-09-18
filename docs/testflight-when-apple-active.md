# When Apple Developer is Active → TestFlight

**Open this file** once [developer.apple.com/account](https://developer.apple.com/account) shows membership **Active** (not Pending).

Full checklist: [app-store-submission-checklist.md](./app-store-submission-checklist.md) · Issue [010](../scratch/issues/010-app-store-submission.md)

---

## IDs (already set in repo)

| Thing | Value |
|-------|--------|
| App name | **Booth Buddy** |
| Bundle ID | `com.dinnagonzales.boothbuddy` |
| Android package | `com.dinnagonzales.boothbuddy` |
| Expo account | `titadinna` |
| Expo project | [@titadinna/market-day](https://expo.dev/accounts/titadinna/projects/market-day) |
| EAS project ID | `6f82a4d7-8280-466b-8b4c-8cd10aad459a` |
| Config files | `market-day/app.json`, `market-day/eas.json` |
| Suggested SKU | `boothbuddy-001` |

---

## Checklist — do in order

### A. Confirm Apple ready
- [ ] Membership **Active** on developer.apple.com/account
- [ ] Can open [appstoreconnect.apple.com](https://appstoreconnect.apple.com) without “isn’t enabled” error
- [ ] Accept any **Agreements, Tax, and Banking** prompts

### B. Create App Store Connect app
- [ ] **Apps → + → New App**
- [ ] Platform: iOS
- [ ] Name: **Booth Buddy**
- [ ] Bundle ID: **`com.dinnagonzales.boothbuddy`** (register under Identifiers first if missing)
- [ ] SKU: `boothbuddy-001`
- [ ] Create

### C. Build + upload (from Mac)
```bash
cd market-day
eas login          # if needed — account titadinna
eas build --platform ios --profile production --auto-submit
```
- [ ] Build finishes on Expo
- [ ] Submit reaches App Store Connect
- [ ] Wait ~10–15 min for Apple processing (TestFlight → iOS Builds)

### D. Install on iPad (private)
- [ ] App Store Connect → Booth Buddy → **TestFlight**
- [ ] **Internal Testing** → create group → add your Apple ID
- [ ] iPad: install **TestFlight** app → accept invite → **Install** Booth Buddy
- [ ] Smoke test: setup → Make a Sale → payment → Settings gate

### E. Before public App Store (later, optional)
- [ ] Privacy policy: replace `CONTACT_EMAIL` in `docs/privacy-policy.md` + `web/privacy.html`, host URL
- [ ] Screenshots, description, category **Business**
- [ ] Review notes: Pass Code gate; Staff never sees cost/totals; local-only
- [ ] Submit for App Review — or leave on TestFlight only / Pending Developer Release / Unlisted

---

## Tomorrow’s fair (if ASC still Pending)

Use **Expo Go** — no Apple Active needed:

```bash
cd market-day
npm start -- --tunnel
```

iPad: Expo Go → scan QR. Keep Mac running. Don’t force-quit Expo Go during the day.

---

## Links

- [Expo TestFlight docs](https://docs.expo.dev/submit/testflight/)
- [EAS Submit iOS](https://docs.expo.dev/submit/ios/)
- Privacy draft: [privacy-policy.md](./privacy-policy.md) · [web/privacy.html](../web/privacy.html)
