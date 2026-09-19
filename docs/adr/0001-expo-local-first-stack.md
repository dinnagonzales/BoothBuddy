# Expo + SQLite local-first stack for iOS App Store

Market Day ships as a native iOS app with all data on-device, no backend, and CSV export via the system share sheet. Given a frontend web background, a ~3-week deadline (market ~Sep 18), and App Store distribution without requiring a local Mac for builds, we chose **Expo (managed workflow) + TypeScript + expo-sqlite**.

**Considered options:** PWA (no real App Store presence, weak share/export on iOS), Swift/SwiftUI (best native UX, steepest learning curve under deadline), React Native bare (more config, no clear win over Expo for this scope).

**Consequences:** Apple Developer Program ($99/yr) and EAS Build are required Day-1 actions. Kids Category is avoided — this is a real-money POS listed under **Business**, with a parental gate for admin areas. Third-party analytics and ads are excluded entirely. On-device integrity for Sales (foreign keys + crash-safe `sales` rebuilds) is recorded in [0003-sqlite-fk-and-crash-safe-sales-rebuild.md](./0003-sqlite-fk-and-crash-safe-sales-rebuild.md).
