# CLAUDE.md — Slumbering (Android)

This file governs how Claude Code should build and modify this repository.
It reconciles `PRD.md` (rationale/principles) and `PRODUCT_DESCRIPTION.md`
(feature + screen spec) — the two disagreed on a few points about the
*current* state of the app; resolutions are called out explicitly below
(§0) so nobody re-derives the wrong answer from either source doc later.

**Who this is for**: primarily students who know healthy sleep habits but
struggle with consistency. Keep this in mind for copy tone — permission-
giving, never clinical or guilt-based (see §7).

**Platform scope**: Android only. Both source docs describe a cross-platform
Expo/iOS/Android/web codebase — this build target is Android-only by
explicit decision. Do not add `Platform.OS` branching for iOS/web, and
don't worry about web fallbacks (e.g. browser-download export, web no-ops
for notifications) — implement the Android path only.

---

## 0. Resolved contradictions between PRD.md and PRODUCT_DESCRIPTION.md

The two source docs disagreed on three points. These are now decided —
build to the resolution, not to whichever source doc you happen to read:

1. **Notifications are real, not inert.** Originally stripped down to
   preference-storage-only per `PRODUCT_DESCRIPTION.md` §4, then explicitly
   reintroduced as real `expo-notifications` scheduling per an explicit
   feature request (see §6 below, which is now the authoritative section —
   `PRODUCT_DESCRIPTION.md` §4 describes the earlier, now-superseded, inert
   state). The three reminder toggles request permission and schedule/cancel
   real OS notifications, not just store a preference.
2. **Achievements/badges are in scope.** `PRD.md` never mentions the badge
   system at all (an omission in that doc, not a signal to exclude it).
   Build the full system from `PRODUCT_DESCRIPTION.md`: 7 fixed badges
   (see §5 for the current roster and rules), celebration modal, engagement
   milestones, `celebratedAchievementIds` gating. See §5.
3. **Check-in collects actual times when the user says "not as planned."**
   Resolved as: check-in first asks a simple "did you keep to your planned
   bedtime/wake time?" yes/no. If **yes** → done, no further input,
   consistent with PRD's "no detailed sleep data entry" framing for the
   common case. If **no** → reveal actual bedtime/wake time pickers, and
   the delta (±15 min tolerance) feeds classification + the Recap card's
   average bedtime deviation tile. This satisfies both docs: the default
   path is frictionless yes/no, detailed entry is opt-in/conditional only.
4. **Accent color is fixed, not configurable.** `PRODUCT_DESCRIPTION.md` and
   the shipped code have never had a per-theme accent picker — `PRD.md` §7
   confirms an earlier swatch picker was removed and accent is now a single
   fixed token per theme (`theme.colors.accent` in `theme/tokens.ts`), chosen
   at design time. Do not build a picker, an "accent" step in onboarding, or
   a Settings control for it — this corrects an earlier draft of this file
   that stated the opposite here while §2/§4/§7 already said "fixed."


---

## 1. Tech stack

| Concern | Choice |
|---|---|
| Framework | Expo SDK 57 (managed workflow), Android build target |
| Language | TypeScript, `strict: true` |
| Navigation | `@react-navigation/native-stack`, single stack |
| State | Zustand + `zustand/middleware` `persist`, backed by `@react-native-async-storage/async-storage` |
| Schema validation | `zod` (settings/records shapes, and JSON import validation) |
| Backup export/import | `expo-file-system` + `expo-sharing` (export via OS share sheet), `expo-document-picker` (import) |
| Notifications package | `expo-notifications` is a dependency for the *preference UI only* — see §0.1/§6, do not use its scheduling APIs |
| Styling | `StyleSheet.create`, theme tokens from a central `theme/` module — no styled-components, no NativeWind |
| Testing | Jest + `@testing-library/react-native` for components; plain Jest for pure logic modules |
| Lint/format | ESLint (`eslint-config-expo`) + Prettier |

No custom native modules, no EAS development build required — everything
here runs on the standard Expo managed workflow. Do not introduce Redux,
MobX, React Query, or any backend/network client — this app has no backend
and no remote data.

Avoid web-only concepts (e.g., no <div>, span, or browser localStorage) and instead use <View>, <Text>, and native primitives.
---

## 2. Folder structure

Organize by **domain feature**, not by file type. Screens are thin — they
compose components and call feature logic, they don't contain business
logic themselves. This keeps debugging simple: if a bug is in streak
math, it's in `features/journey/logic/`, not scattered across a screen.

```
src/
  app/
    AppShell.tsx            # onboarding gate + root navigator mount
    RootNavigator.tsx        # native-stack, headerShown: false
    navigation.types.ts      # RootStackParamList, typed per route table below

  screens/
    Home/HomeScreen.tsx
    GoalPicker/GoalPickerScreen.tsx
    TonightConfirmation/TonightConfirmationScreen.tsx
    CheckIn/CheckInScreen.tsx
    Journey/JourneyScreen.tsx
    AddPastRecord/AddPastRecordScreen.tsx
    Settings/SettingsScreen.tsx
    SleepScience/SleepScienceScreen.tsx
    Bedtime/BedtimeScreen.tsx
    Onboarding/OnboardingScreen.tsx   # not a route — rendered by AppShell

  features/
    goals/
      logic/                 # looksLikeUnhealthyBedtime, suggestion-bank edit
      components/            # GoalCategoryPicker, GoalChip, CustomGoalInput
      types.ts
    checkin/
      logic/                 # "as planned?" gate, delta classification (on-time/shorter/longer, ±15min), backfill-at-2am
      components/            # includes the conditional actual-time picker step
    journey/
      logic/                 # streak calc, milestones, engagement milestones, strongest-category calc, sleep-duration helper
      components/            # TimelineList, SuccessRing, DotJourney (JourneyDotGraph, used on Home only)
    achievements/
      logic/                 # badge rule evaluation, celebratedAchievementIds gating
      components/            # CelebrationModal, Toast
      badges.ts               # the 7 fixed badge definitions — single source of truth
    bedtime/
      logic/                  # series.ts (week/month bedtime/wake/duration series), regularity.ts (SD-based proxy), recommendations.ts (priority-ordered personalized tip)
      components/             # LineGraph, DurationBarGraph, RecommendationCard
      pools/                  # recommendation copy by category
    companion-messages/
      logic/                 # priority-ordered picker, date-seeded pools, no-repeat-day-to-day
      pools/                  # message copy by category
    notifications/
      preferences.ts          # computeWindDownTime — derives the wind-down reminder's time from bedtime
      logic/                  # permissions.ts, handlers.ts, scheduler.ts, sync.ts — real expo-notifications scheduling, see §6
    backup/
      logic/                  # export to JSON, import + zod validation, destructive-overwrite confirm
    settings/
      logic/                  # theme, text size, profile editing

  components/                # generic, feature-agnostic design-system primitives
    Button.tsx
    Card.tsx
    Pill.tsx
    BackRow.tsx               # every screen's in-content back control
    ScreenContainer.tsx

  store/
    settingsStore.ts          # zustand slice: profile, theme, textSize, reminders, suggestedGoals, celebratedAchievementIds, bedtime, wakeTime
    recordsStore.ts           # zustand slice: nightly records (goals + achieved status by date)
    persist.ts                # shared AsyncStorage persist config/version

  theme/
    tokens.ts                 # colors (dusk-purple + gold/blush/sage), radii, spacing — accent is fixed per theme, no picker
    typography.ts             # Quicksand 500/600/700 scale
    ThemeProvider.tsx          # applies light/dark + text size instantly and globally

  lib/
    dateSeed.ts                # deterministic date-seeded RNG used by companion messages + insight text
    dateMath.ts                # streak/backfill date arithmetic, 2am cutoff logic
    schemas.ts                 # zod schemas for settings/records + import validation

  types/
    domain.ts                  # NightGoal, NightRecord, Settings, Achievement, etc.

App.tsx
```

Rules:
- A `screens/*` file may import from `features/*`, `components/*`, `theme/*`, `store/*`. It should not contain calculation logic inline — extract to `features/<domain>/logic/` so it's independently testable.
- A `features/*` `logic/` file must be a pure function module wherever possible (input state → output), no React, no AsyncStorage calls directly — it reads/writes through the store.
- Cross-feature imports go through `types/domain.ts`, not by reaching into another feature's internals.

---

## 3. Navigation

Single native-stack navigator, `headerShown: false` globally. `Onboarding`
is **not** a route — it's rendered by `AppShell` directly, gated on
`settings.hasOnboarded`, and (per §0) is currently a one-way gate with no
re-entry point from Settings.

| Route | Params | Presentation |
|---|---|---|
| `Home` | — | pushed, initial route |
| `GoalPicker` | `{ mode: 'create' \| 'edit' }` | pushed |
| `TonightConfirmation` | `{ goals: NightGoal[] }` | pushed |
| `CheckIn` | — | pushed |
| `Journey` | — | pushed |
| `AddPastRecord` | `{ date?: string }` | native modal — the only modal in the app, use `presentation: 'modal'` on this screen only |
| `Settings` | — | pushed |
| `SleepScience` | — | pushed |
| `Bedtime` | — | pushed |

Back navigation: every screen's in-content back row (`components/BackRow.tsx`)
navigates straight to `Home` via `navigation.navigate('Home')`, **except**
`SleepScience` and `AddPastRecord`, which use `navigation.goBack()` since
they're only ever reached from one place each (Settings, and Journey's FAB).
Don't genericize this — hardcode the two `goBack()` exceptions explicitly
in those two screens so the behavior is easy to find later.

Type `RootStackParamList` in `navigation.types.ts` from the table above and
use `NativeStackScreenProps<RootStackParamList, 'RouteName'>` for every
screen's props — no untyped navigation.

---

## 4. State shape

Two persisted zustand stores, both wrapped in `persist` with AsyncStorage,
versioned (`version: 1`) so future shape changes can migrate cleanly.

```ts
// settingsStore
{
  hasOnboarded: boolean;
  profile: { displayName: string };
  theme: 'light' | 'dark';      // accent per theme is a fixed token, not stored/configurable
  textSize: 'small' | 'medium' | 'large';
  bedtime: string;   // "HH:mm"
  wakeTime: string;  // "HH:mm"
  reminders: {
    setGoals: { enabled: boolean; time: string };
    checkIn: { enabled: boolean; time: string };
    windDown: { enabled: boolean }; // time is always derived, never stored as user-set
  };
  suggestedGoals: { bedtime: string[]; windDown: string[]; relaxation: string[] };
  celebratedAchievementIds: string[]; // achievement ids whose modal has already fired
}

// recordsStore
{
  records: Record<string /* yyyy-mm-dd */, {
    date: string;
    goals: NightGoal[];              // each goal carries its own `achieved: boolean | null` — no separate map
    goalsSetAt: string | null;       // ISO timestamp
    checkInCompletedAt: string | null; // ISO timestamp; used by Early Riser + streak/backfill logic
    source: 'normal' | 'backfilled'; // 'backfilled' = added/edited via Add a Past Record / Journey history edit, never auto-generated
    plannedBedtime: string | null;   // "HH:mm", snapshotted from settings.bedtime at goal-set time
    plannedWakeTime: string | null;  // "HH:mm"
    sleepConfirmation: 'asPlanned' | 'reportedDifferent' | null; // the check-in gate question — see §0.3
    actualBedtime: string | null;    // only set when sleepConfirmation === 'reportedDifferent'
    actualWakeTime: string | null;
  }>;
}
```

The types above (`NightGoal`, `NightRecord`, `SettingsState`, etc.) are owned
by the zod schemas in `lib/schemas.ts` — that's the single source of truth
for both runtime validation and the TS types, re-exported from
`types/domain.ts` for convenience. Don't hand-write a second, parallel
interface for these shapes elsewhere; extend the zod schema and let the type
follow from it. Keep badge ids and reminder keys as string literal unions
too, not free-form strings, so typos fail at compile time.

---

## 5. Business logic Claude Code must get right

These are the parts of the spec most likely to be implemented sloppily.
Implement each as its own tested pure function in the indicated module.

- **`looksLikeUnhealthyBedtime`** (`features/goals/logic`): regex-based, flags a named bedtime between 12:00am–4:59am inclusive. Non-blocking — returns a warning string ("Sleep experts generally recommend an earlier bedtime. Would you like to continue with this goal?"), never prevents saving. Present as **Continue** / **Change goal**.
- **Suggestion bank editing** (`features/goals/logic`): editing a suggested goal's label mutates `settings.suggestedGoals` itself, not just the in-progress selection. Don't accidentally scope this to local component state only. (`AddPastRecord`'s own goal-relabeling is the deliberate exception — it edits a local-only copy, never `settings.suggestedGoals`.)
- **Check-in flow** (`features/checkin/logic`): step 1 is always "did you keep to plan?" yes/no. Only on "no" do actual bedtime/wake time pickers appear. Compare actual vs. planned with a ±15 minute tolerance band → `'on-time' | 'shorter' | 'longer'`, feed the result into date-seeded feedback text. On "yes," skip straight to goal achievement confirm — don't force the time pickers.
- **Streak** (`features/journey/logic`): consecutive fully-achieved (all goals `true`), checked-in days counting back from today or yesterday (i.e. a still-open today doesn't break an existing streak).
- **Milestones vs. engagement milestones** (`features/journey/logic`): two separate cumulative counters — fully-achieved nights (5/10/30/50/100/365) vs. any-goal-achieved nights (1/5/10/20/30/40/50, then every 50). Don't conflate them.
- **Achievement unlock + celebration gating** (`features/achievements/logic`): evaluate all 7 badges (`firstStep`, `fullWeek`, `oneMonth`, `welcomeBack`, `goGetter`, `fullNight`, `steadyRhythm` — see `badges.ts` for the current roster; there is no `earlyRiser` badge) on every check-in confirm. A badge unlocked today (not previously in `celebratedAchievementIds`) → celebration modal; anything else newly true this session but not "today" → silent, no modal, still add to `celebratedAchievementIds` once shown. On first load for a pre-existing user, backdated unlocks must not trigger modals — seed `celebratedAchievementIds` accordingly rather than leaving it empty. Note the **Welcome Back badge uses a ≥5-day gap**, which is intentionally different from the companion message's 3+ day "returning" tier below — don't unify these thresholds, they gate different things (a once-ever celebration vs. a daily message pool). `fullWeek` is a 7-calendar-consecutive-day streak gated on "at least one goal achieved" per night (not full achievement); `oneMonth` is a cumulative, non-consecutive count of 30 checked-in nights all-time; `fullNight` accumulates (non-consecutively) 10 nights whose derived sleep duration (`journey/logic/duration.ts`'s `sleepDurationMinutes`) is ≥7h; `steadyRhythm` needs a 14-calendar-consecutive-night run whose bedtimes each fall within ±30min of that window's own average.
- **Companion message picker** (`features/companion-messages/logic`): strict priority order — first-time user → returning after 3+ day gap → just-hit major milestone → streak band (3–6 / 7–29 / 30+) → last-night goal-status fallback (highest priority *when applicable*, i.e. check-in done but tonight's goals not yet set) → default encouragement. Each pool is date-seeded (`lib/dateSeed.ts`) and must avoid repeating the exact same line as the previous day within the same pool.
- **Strongest goal category** (`features/journey/logic/strongestCategory.ts`): achieved/total rate per category, ties favor bedtime > windDown > relaxation > custom. Surfaced on Home's `JourneyPreviewCard` scoped to the trailing 7 days (`journeyEntries.ts`'s `recordsInLastSevenDays`) — there is no separate week/month Recap card on Home; that was removed in favor of this plus the Bedtime page below.
- **Bedtime page** (`features/bedtime/logic`): week/month bedtime, wake-time, and duration series built from `recordsStore`, gated the same way as everywhere else (a night only counts once `checkInCompletedAt` is set and `sleepConfirmation` is non-null). Bedtimes wrap past midnight, so `lib/dateMath.ts`'s `normalizeBedtimeMinutes`/`normalizedMinutesToTime` shift any pre-noon clock time into "the next day" before averaging/variance — always use these rather than raw minutes-since-midnight for bedtime math. Regularity is a proxy (no true Sleep Regularity Index without continuous epoch data): population SD of a series, bucketed as High Regularity (≤30min) / Moderate Regularity (30–60min) / Irregular (60–90min) / Severely Irregular (≥90min). The personalized recommendation is a single date-seeded tip chosen by priority — short average duration (<8h) > irregular bedtime or wake timing > late average bedtime vs. target > late average wake time vs. target > general tips fallback — never show more than one at a time.
- **Backup export/import** (`features/backup/logic`): export = full `settings` + `records` to JSON via the native share sheet (`expo-file-system` + `expo-sharing`). Import = pick `.json` (`expo-document-picker`), validate shape with the `zod` schema in `lib/schemas.ts`, show a destructive-confirm dialog before overwriting, reject on shape mismatch with a clear error rather than partially applying.

---

## 6. Notifications — real scheduling, reintroduced by explicit request

`settings.reminders[key].enabled` / `.time` are still the stored
preferences, but they now drive real `expo-notifications` scheduling (this
was previously inert-by-design; it was reintroduced as its own explicit
feature request, not inferred from adjacent UI work — see §0.1).

- `features/notifications/logic/permissions.ts` — `ensureNotificationPermission()` (requests if not already granted), `hasNotificationPermission()` (checks only, never prompts).
- `features/notifications/logic/handlers.ts` — `registerNotificationHandler()`, called once at module scope in `App.tsx`.
- `features/notifications/logic/scheduler.ts` — `scheduleDailyReminder()` / `cancelReminder()`, keyed by a **fixed identifier per reminder** (`REMINDER_IDS` in `logic/sync.ts`), not a stored/returned notification id. Rescheduling is cancel-by-id then schedule-with-the-same-id. Deliberately do **not** add a `notificationId` field to the persisted reminder objects — it's device-local and would leak into JSON backup export/import.
- `features/notifications/logic/sync.ts` — `syncReminderSchedules(settings)` reconciles all three reminders (schedule if enabled, cancel if not); the wind-down reminder's time is derived via `preferences.ts`'s `computeWindDownTime(bedtime)` since it has no stored `time`.
- Wiring: `AppShell.tsx` runs `syncReminderSchedules` in a `useEffect` watching `reminders`/`bedtime`, but only when permission is already granted — it never itself prompts. The actual `ensureNotificationPermission()` prompt happens in `RemindersSection.tsx`, from the toggle's own `onValueChange` (a user gesture), and reverts the toggle with a toast if permission is denied.
- `app.json` declares the `expo-notifications` config plugin.

If a future task wants to change this further (e.g. store a real
`notificationId`, add new reminder types), treat it normally — the
inert-by-design constraint above no longer applies.

Do not build any OS-level Do Not Disturb / brightness / always-on-display
automation ("Sleep Mode") — it was evaluated and dropped as infeasible
even for Android alone within this scope (native module + EAS build cost
for a solo-maintained, minimalist app); the Bedtime Schedule panel is
display-only, positioned last on Home (after `JourneyPreviewCard`) and
tapping it (outside its two inline time fields, which keep editing
in place) opens the read-only `Bedtime` analytics page. Neither the panel
nor the Bedtime page touch any phone-level setting, schedule their own
notifications, or run background logic.

---

## 7. Design system & voice

Source of truth is `PRODUCT_DESCRIPTION.md` §5 and the linked design
catalog — read `tokens.html` from the catalog before hardcoding any color
or spacing value.

- Font: Quicksand, weights 500/600/700 only.
- Shape: 16–40px radii on cards, full pill (999px) on buttons/badges, one asymmetric "organic" radius reserved for a single hero/quote element per screen — don't reuse that radius elsewhere.
- Color: one dusk-purple + gold/blush/sage accent palette shared by both themes; only surface/text colors invert light↔dark. The CTA gradient and "night" card surface are **theme-fixed** — always dusk-dark regardless of app theme. Implement these as separate token names (e.g. `colors.fixed.nightSurface`) so they're never accidentally pulled into the themed palette. Accent color itself is fixed per theme, not user-configurable (§0).
- Voice: sentence case, no emoji, short headline copy, permission-giving tone ("Every bit of effort counts."), never clinical or prescriptive. Hard rule: never frame a missed goal as failure — banned phrasing includes "You failed," "Your streak is broken," "You missed your goal." Every return to the app, even after a long lapse, is a positive action, not a recovery from failure. Put all user-facing strings in the relevant `features/*/pools` or a screen-local `copy.ts`, not inline in JSX, so tone stays auditable.
- Dot graph: gold filled dot = all goals achieved, blush filled dot = partially achieved, outline dot = none/no record. Used both in the Home journey preview (last 7 nights) and at the top of the full Journey screen.
- Text size (small/medium/large) and theme apply instantly and globally via `ThemeProvider` — don't require app restart or navigation to pick up a change.

---

## 8. Conventions

- One component per file, named exports for logic modules, default export for screen components.
- Every `features/<domain>/logic/*.ts` file gets a co-located `*.test.ts`. Prioritize test coverage on: streak calc, achievement rules, delta classification (including the yes/no gate), date-seeded pickers (assert determinism — same date+state → same output), backfill timing.
- No inline magic numbers for domain rules (15-minute tolerance, 2am cutoff, milestone thresholds, 3-day vs 5-day return windows) — define them as named constants in the relevant `logic/` module or `lib/dateMath.ts`.
- Prefer small, composable `components/` primitives over screen-specific one-off styling.
- Run `npx tsc --noEmit`, `eslint .`, and `jest` before considering a change complete.

---

## 9. Known gaps (documented, not to be silently "fixed")

- No way to re-enter onboarding from Settings once completed. Open question in `PRD.md` §9 — don't build a fix unless explicitly requested.
- Whether the Bedtime Schedule panel should ever grow its own notification, and whether backup/restore should eventually support cloud sync (e.g. Dropbox OAuth) are both open questions in `PRD.md` §9 — out of scope until explicitly requested.
- A bilingual (en/vi) i18n layer (`src/i18n/`, plus `docs/strings.en.js`/`strings.vie.js` as the translation source) was built in an earlier iteration but never wired to a language picker (`LANGUAGE_ORDER` only ever contained `'en'`), and was undocumented in `PRD.md`, `PRODUCT_DESCRIPTION.md`, and this file alike. It was evaluated during the architecture rebuild that brought this codebase in line with §1–§8 and **removed** — all copy is now plain hardcoded English in `features/*/pools/` or a screen-local `copy.ts` per §7. Don't reintroduce an i18n abstraction layer as a "helpful" restoration; if bilingual support is wanted later, treat it as a new feature request.
- `google-services.json`, the Firebase Gradle wiring it triggered, `@gorhom/bottom-sheet`, and `@expo-google-fonts/edu-nsw-act-cursive` were all removed in the same rebuild as unused dead weight — nothing in `src/` ever consumed them. Same rule: don't silently reintroduce without an explicit ask.

---

## 10. Commands

```bash
npx expo start --android      # dev
eas build --platform android  # release build
npx tsc --noEmit
eslint .
jest
```
