# Market Day — Privacy Policy

**Effective date:** August 28, 2026  
**App:** Market Day (iOS)  
**Contact:** Replace with your support email before publishing (e.g. `hello@yourdomain.com`).

---

## Summary

Market Day is a **local-first** point-of-sale app for kid-run craft booths. **We do not operate servers that collect your shop data.** Sales, inventory, and settings stay on your device unless **you** export or share them (for example, a CSV through the iOS share sheet).

We do **not** sell data, show ads, or use third-party analytics.

---

## Who this app is for

Market Day is listed in the App Store **Business** category. A child (**Seller**) can log sales at the booth. A grown-up (**Admin**) sets up items, manages market days, and exports data behind a **Pass Code** (parental gate). Sellers do not see item cost or profit totals.

---

## Information stored on your device

All of the following is stored **locally** on your iPhone or iPad (SQLite database and app storage):

| Data | Purpose | Who enters it |
|------|---------|---------------|
| **Items** | Name, emoji, price, cost, optional photo | Admin |
| **Market Days** | Event name and dates | Admin |
| **Sales** | Line items, totals, payment method, cash received, timestamps | Seller / Admin |
| **Sale name & notes** | Optional labels (e.g. customer name, pickup notes) | Admin |
| **Pass Code hash** | Hashed grown-up gate code (SHA-256 in iOS Keychain via Secure Store) | Admin |

We **never** store your Pass Code in readable form.

---

## Information we do not collect

Market Day v1 does **not**:

- Require an account or login
- Transmit shop data to our servers (we have none)
- Use third-party analytics, advertising, or crash-reporting SDKs that collect personal data
- Track location
- Access contacts, calendars, or health data

---

## Photos and camera (optional)

If you use **optional item photos** (when available), images you pick from the photo library or camera are saved **on device only** as part of your item catalog. We do not upload them anywhere.

---

## When data leaves your device

Data leaves the device **only when you choose**:

- **Export CSV** — you pick Mail, AirDrop, Files, or another app via the system share sheet
- **Delete the app** or use **Forgot your code?** factory reset — removes local data from that device

We do not receive copies of exports or shared files.

---

## Children's privacy

Market Day is designed so kids can sell without seeing bookkeeping details (cost, profit, or sales dashboards). The grown-up **Pass Code** protects admin areas.

We do not knowingly collect personal information from children on our servers — because we do not collect data on servers at all. Optional **sale names** or **notes** that a grown-up types (for example a customer's first name) are stored locally under the grown-up's control.

If you believe a child's information was entered into the app in error, delete that sale from grown-up settings or reset the app.

---

## Data retention and deletion

- Data remains on your device until you delete it (sales, items), end/remove market days, or uninstall the app.
- **Forgot your code?** (factory reset) erases all shop data on that device and restarts setup.

There is no cloud backup from Market Day v1. Keep exports you care about in Files or email.

---

## Security

- Shop records live in an on-device database.
- The Pass Code is stored as a one-way hash in the iOS Keychain (Secure Store), not as plain text.
- Protect your device with a screen lock and Pass Code, especially before a market day.

---

## Changes to this policy

We may update this page when the app changes (for example, optional cloud sync in a future **Pro** tier). We will update the **Effective date** at the top. Continued use after changes means you accept the updated policy.

---

## Contact

Questions about this privacy policy:

**[CONTACT_EMAIL]**

Replace the placeholder above before linking this page in App Store Connect.

---

## App Store privacy labels (developer reference)

For App Store Connect **App Privacy** questionnaire (v1, local-only build):

- **Data Not Collected** — accurate if you declare that the developer does not collect data from the app; user-entered content stays on device.
- If Apple asks about **User Content** stored on device only, answer consistent with "not collected by developer" / on-device only.
- Revisit labels if you ship **Pro** cloud sync ([v2-003](../scratch/v2/issues/003-cross-device-sync-pro.md)).
