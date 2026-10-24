# Slumbering

A gentle sleep-habit companion for Android, built for students who know what healthy sleep looks like but struggle to stay consistent. The tone is permission-giving, never clinical or guilt-based: a missed goal is never framed as a failure.

The app is **Vietnamese-only** and **Android-only**. It has no backend: all data stays on the device.

## Features

- **Nightly goals**: pick goals from three categories (bedtime, wind-down, relaxation) or write a custom one. Suggested goals can be edited. A non-blocking warning appears for very late bedtimes.
- **Check-in**: confirm the planned bedtime and wake time or edit them (±15 min counts as on plan), then mark which goals you achieved.
- **Journey**: streaks, milestones, a dot graph of recent nights, a timeline, strongest goal category, and an "Add a past record" flow for backfilling.
- **Achievements**: 7 badges (First Step, Full Week, One Month, Welcome Back, Go-getter, Full Night, Steady Rhythm) with a celebration modal.
- **Bedtime**: calendar week/month charts of bedtime, wake time and duration, a regularity band, and one personalised tip. The bedtime and wake time are edited here and on Home.
- **Sound**: 8 looping tracks (body-scan meditations, white/pink/brown noise, rain/forest/beach). Playback continues in the background.
- **Reminders**: three real scheduled notifications (set goals, check-in, wind-down).
- **Settings**: light/dark theme, text size, profile name, backup export/import (JSON).

## Tech stack

Expo SDK 57 (managed, with `expo-dev-client`), React Native 0.86, React 19, TypeScript (`strict`), React Navigation native-stack, Zustand with AsyncStorage persistence, Zod, `expo-audio`, `expo-notifications`, `expo-file-system`, `expo-sharing`, `expo-document-picker`, Quicksand font. Tests use Jest with `@testing-library/react-native`.

## Getting started

```bash
npm install
npm run android      # build and run a dev build on a device/emulator
npm start            # start Metro for an installed dev build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint .
npm test             # jest
```

Background audio and notifications do not work in Expo Go; use a development build.

Release build:

```bash
eas build --platform android --profile preview      # installable APK
eas build --platform android --profile production
```

## Project structure

```
App.tsx                      entry: fonts, providers, notification handler
src/
  app/                       AppShell (onboarding gate), RootNavigator, route types
  screens/                   thin screens: Home, GoalPicker, TonightConfirmation, CheckIn,
                             Journey, AddPastRecord, Settings, Bedtime, Sound, Onboarding
  features/<domain>/         logic/ (pure, tested), components/, types
                             achievements, backup, bedtime, checkin, companion-messages,
                             goals, journey, notifications, settings, sound
  components/                shared UI primitives (Button, Card, BottomTabBar, ModalScrim, ...)
  copy/                      strings.ts (all Vietnamese UI text), format.ts (fmt)
  store/                     settingsStore, recordsStore (persisted Zustand)
  theme/                     tokens, typography, ThemeProvider
  lib/                       dateMath, dateSeed, zod schemas
  types/                     domain types derived from the schemas
assets/                      all static files (see below)
```

Navigation is a single native stack. Home, Journey, Bedtime and Sound are the four tabs (a persistent `BottomTabBar`); Settings is reached from the top bar.

## Assets

Everything static lives in `assets/`:

| Folder | Contents |
|---|---|
| `app-icon/` | App icon / adaptive icon foreground (`mascot.png`) and the monochrome icon |
| `images/` | Moon, sun, cloud sheep, wordmark |
| `badges/` | Seven badge illustrations and the locked silhouette |
| `sound-covers/` | Cover art for the 8 sound tracks (bundled) |
| `audio-source/` | Master mp3s. **Not bundled**: excluded from EAS builds via `.easignore` |

Icons in the tab bar are inline SVG components, not files.

## Sound hosting

The mp3s are not shipped in the APK. Each track has a `remoteFile` in `src/features/sound/catalog.ts`, which is appended to `expo.extra.soundAssetBaseUrl` in `app.json` (currently a GitHub Releases download URL). The first tap downloads the file into the app's document directory; later plays use the local copy. A failed or tiny (<1 KB) download shows a toast and is discarded.

GitHub release assets are a flat list, so upload the files from `assets/audio-source/` **by bare filename**:

`body-scan-short.mp3`, `body-scan-full.mp3`, `white.mp3`, `pink.mp3`, `brown.mp3`, `rain.mp3`, `forest.mp3`, `beach.mp3`

To change hosts, upload the same filenames and update `soundAssetBaseUrl`.

## Data and backup

Settings and nightly records are persisted locally (versioned Zustand `persist`). Export writes a JSON file via the share sheet; import validates it with Zod and asks for confirmation before overwriting. Shapes are defined once in `src/lib/schemas.ts`.

## Conventions

- All user-facing text goes through `COPY` (`src/copy/strings.ts`) and `fmt()`; no inline strings.
- Domain rules live in pure `features/*/logic` modules with co-located `*.test.ts`, with named constants instead of magic numbers.
- No emoji; sentence case; never "You failed" or "streak broken" phrasing.
- Run `npm run typecheck`, `npm run lint` and `npm test` before finishing a change.

## License

See [LICENSE](LICENSE).
