# Kid-Friendly App Store App Resources

## Knowledge

- [Expo SQLite — official docs](https://docs.expo.dev/versions/latest/sdk/sqlite/)
  Structured local database for progress, streaks, and sheet history. Use for: any data beyond simple key-value settings.
- [Expo FileSystem — official docs](https://docs.expo.dev/versions/latest/sdk/filesystem/)
  App sandbox paths (document, cache). Use for: saved PDF sheets, exported files.
- [Expo Print — official docs](https://docs.expo.dev/versions/latest/sdk/print/)
  Turn HTML into a PDF file in the app cache. Use for: daily/weekly/monthly sheet generation.
- [Expo Sharing — official docs](https://docs.expo.dev/versions/latest/sdk/sharing/)
  Opens the native share sheet (Mail, Messages, AirDrop, Save to Files). Use for: handing a sheet to the parent's email app — no server required.
- [Expo Notifications — official docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
  Local scheduled reminders on the device. Use for: "Time to send your weekly sheet!" — not for silent auto-email.
- [Apple — Design safe experiences for kids](https://developer.apple.com/kids/)
  Kids Category requirements, parental gates, age bands. Use for: compliance decisions before App Store submission.
- [App Store Review Guidelines 5.1.4 — Kids](https://developer.apple.com/app-store/review/guidelines/#kids)
  No third-party analytics/ads in Kids Category; careful with PII. Use for: privacy architecture review.
- [React Native — Environment setup](https://reactnative.dev/docs/environment-setup)
  Entry point for understanding how a web dev path differs from Expo managed workflow.
- [Expo — Submit to Apple App Store](https://docs.expo.dev/submit/ios/)
  Official EAS Submit walkthrough. Use for: first upload, API key setup, TestFlight handoff.
- [Expo — Build for iOS](https://docs.expo.dev/build/introduction/)
  Cloud builds without a local Mac. Use for: production `.ipa` generation.
- [Apple — Enroll in Developer Program](https://developer.apple.com/programs/enroll/)
  $99/yr membership required before any upload. Use for: Day 1 action item.
- [Apple — Submit for review overview](https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/overview-of-submitting-for-review)
  What happens after upload. Use for: metadata, review notes, release timing.
- [Apple — App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
  Full rulebook. Use for: Kids Category (5.1.4), privacy, parental gates.

## Wisdom (Communities)

- [Expo Discord](https://chat.expo.dev/)
  High-signal help for Expo/React Native questions. Use for: share sheet quirks, App Store build issues.
- [r/reactnative](https://reddit.com/r/reactnative)
  Broader RN community. Use for: architecture questions; verify answers against official docs.
- [Apple Developer Forums — App Store Connect](https://developer.apple.com/forums/tags/app-store-connect)
  Use for: Kids Category review rejections and clarification.

## Gaps

- No curated resource yet for COPPA checklist specific to "local-only + parent-initiated email share" pattern. Will add after more research.
