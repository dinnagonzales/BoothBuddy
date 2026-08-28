# HeroUI Native for reusable UI

Market Day uses [HeroUI Native](https://heroui.com/) (the React Native sibling of HeroUI React) with [Uniwind](https://docs.uniwind.dev/) for Tailwind-style `className` styling. Shared primitives live in `components/ui/` (granular imports) and layout helpers in `components/Screen.tsx`. Theme tokens in `global.css` map the mock palette (purple accent, lavender background) to HeroUI CSS variables.

**Considered options:** Raw React Native StyleSheet only (fast start, no reusable system), NativeWind (mature but HeroUI Native officially targets Uniwind), HeroUI React (web only — not for App Store iOS builds).

**Consequences:** Use `heroui-native/*` granular imports consistently; a single `import from 'heroui-native'` defeats bundle splitting. HeroUI Native is mobile-first — do not rely on `expo start --web` for production UI.
