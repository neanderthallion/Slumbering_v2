# Slumbering — Product Description

A companion reference to [`PRD.md`](./PRD.md) (which covers the product's rationale
and principles). This document is a feature-by-feature and screen-by-screen
description of the app plus its complete navigation map — see also the visual
[design catalog](./design-catalog/index.html) for what each screen and popup
actually looks like.

## 1. Overview

Slumbering is a minimalist sleep-habit companion app (Expo/React Native,
Android). Each night the user picks one or two small,
self-chosen sleep goals; each morning they do a quick check-in on whether they
hit them. Progress is reflected back through a gentle, encouraging voice and a
connected-dot journey timeline — never through streak-shaming or punitive
scoring. State is local-first (AsyncStorage-backed); there is no backend.

## 2. Full feature list, by domain

### Goals &amp; night plans
- Each night the user selects **1–2 goals** across three categories: Bedtime,
  Wind-down, Relaxation, drawn from an editable suggestion bank
  (`settings.suggestedGoals`), or types a fully custom goal.
- Editing a suggested goal's label **permanently rewrites the suggestion
  bank**, not just that one instance.
- A regex heuristic (`looksLikeUnhealthyBedtime`) flags goals naming a very
  late bedtime (12am–4:59am) with a non-blocking disclaimer; the user can
  still continue.
- A **default night plan** (editable list of fallback goal labels) is
  auto-applied as a "backfilled" record if the user never sets goals for the
  previous night before 2am.

### Check-in
- Next-day, per-goal Yes/No/unanswered.
- Optional "did you sleep as planned?" step — if not, the user reports actual
  bedtime/wake time, and the delta (±15 min tolerance) is classified into
  on-time / shorter / longer than planned, surfaced as date-seeded feedback
  text.
- Confirming runs achievement detection and shows a celebration modal if
  anything new unlocked, otherwise a toast.

### Journey, history &amp; streaks
- **Streak**: consecutive fully-achieved, checked-in days counting back from
  today/yesterday.
- **Milestones**: cumulative fully-achieved nights at 5, 10, 30, 50, 100, 365.
- **Engagement milestones**: cumulative nights with *any* goal achieved, at
  1, 5, 10, 20, 30, 40, 50, then every 50 after.
- Full reverse-chronological timeline merging logged nights, milestones, and
  achievement unlocks.
- **Recap card** (Home): week/month completion rate, delta vs. the prior
  period, current streak, average bedtime delta, strongest goal category, and
  a date-seeded insight sentence.
- Manual **back-fill**: add a past date's goals + achieved status directly
  (must be before today).

### Achievements &amp; badges
Five fixed, once-ever badges:

| Badge | Trigger |
|---|---|
| First Step | Completed your first check-in ever. |
| Full Week | 7 consecutive nights, all goals achieved. |
| One Month | 30 consecutive nights, all goals achieved. |
| Early Riser | Checked in before 8:00 AM on 5 different days. |
| Welcome Back | Returned and checked in after a ≥5-day gap. |

Only unlocks dated *today* trigger the celebration modal (tracked via
`settings.celebratedAchievementIds`), so existing users aren't flooded with
back-dated celebrations the first time this feature loads.

### Bedtime schedule
Display-only (Home screen): editable target bedtime and wake time, with the
resulting sleep duration shown as a pill ("Sleep duration · 8h 0m"). Changing
bedtime auto-recomputes the Wind-Down reminder's time (bedtime − 10 min). This
intentionally replaced a more ambitious "Sleep Mode" (OS-level Do Not
Disturb / brightness / always-on-display automation) that existed in the
app's first version and was later removed as infeasible cross-platform — see
`PRD.md` §7.1 for the full feasibility writeup.

### Companion messages &amp; greeting
Priority-ordered pick each day: first-time user → returning after a 3+ day
gap → just-hit major milestone → streak band (3–6 / 7–29 / 30+ days) →
goal-status fallback (reflecting last night's outcome) → default
encouragement. Pools are date-seeded and avoid exact repeats day-to-day.

### Onboarding
First-run only, not a navigable route: name entry (optional) + light/dark
theme choice, then `hasOnboarded: true` unlocks the main app.

### Settings
- **Profile** — display name.
- **Reminders** — see §4 below.
- **Default night plan** — edit the fallback goal list.
- **Appearance** — light/dark theme, text size (small/medium/large), applied
  instantly and globally.
- **Backup &amp; restore** — export settings + records to a JSON file (native
  share sheet or browser download); import from a picked `.json` file, with
  shape validation and a destructive-action confirmation before overwriting
  local data. This is a manual file-based backup, not cloud sync.
- **App info** — version, and links to Sleep Science (real in-app article),
  Terms of Service / Contact Us / Feedback (currently placeholder stubs).
- **Sleep Science** — a static long-form article on the behavioral-science
  rationale behind the app's design choices (autonomy-driven goal caps,
  anti-shame companion voice, dot-timeline over dashboards, frictionless
  check-ins, dropping device automation).

## 3. Navigation map

The app is a single native-stack navigator (`headerShown: false` globally,
every screen builds its own in-content back row) with `Home` as the initial
route. `Onboarding` is not part of the stack — it's a pre-navigator gate
rendered directly by `AppShell` while `settings.hasOnboarded` is false.

| Route | Params | Presentation |
|---|---|---|
| `Home` | — | pushed, initial route |
| `GoalPicker` | `{ mode: 'create' \| 'edit' }` | pushed |
| `TonightConfirmation` | `{ goals: NightGoal[] }` | pushed |
| `CheckIn` | — | pushed |
| `Journey` | — | pushed |
| `AddPastRecord` | `{ date?: string }` | **native modal** (the only one) |
| `Settings` | — | pushed |
| `SleepScience` | — | pushed |

**Entry points:**
- Home → Settings (gear icon)
- Home → Goal Picker, create mode (primary CTA, no goals set yet) or edit
  mode ("Edit goals" link, goals already set)
- Home → Check-In (primary CTA, once goals are set and check-in is due)
- Home → Journey (tap the Recap card or the Journey preview card)
- Goal Picker → Tonight Confirmation ("Confirm goals", create mode only —
  edit mode saves directly and returns to Home)
- Journey → Add Past Record (floating action button)
- Settings → Sleep Science ("Sleep science references" link)

**Back navigation:** every secondary screen's back row returns straight to
`Home` (not `goBack()`), except Sleep Science and Add Past Record, which use
`goBack()` since they're only ever reached from one place (Settings, and
Journey's FAB, respectively).

Full per-screen behavior, states, and popups are documented in the
[design catalog](./design-catalog/index.html).

## 4. Notifications — as designed in the initial version

**This section describes the reminder system's original, intended design.**
The current in-session build stores these as plain preferences
(`settings.reminders[key].enabled`/`.time`) without any OS-level scheduling —
see the note at the end of this section for why, and the design catalog's
[Settings page](./design-catalog/screens/settings.html) for how that
currently renders.

Three configurable local reminders, each with its own on/off toggle:

| Reminder | Default | Copy | Time editable? |
|---|---|---|---|
| Set Goals | 9:00 PM | "Time to choose your sleep goals for tonight." | Yes |
| Check-In | 8:00 AM | "How did you do with last night's goals?" | Yes |
| Wind-Down | bedtime − 10 min | "It's nearly bedtime. Ready to wind down?" | No — auto-derived from the Bedtime Schedule panel; UI always shows "10 min before bedtime" instead of a picked time. |

**Permission flow.** Toggling a reminder **on** first calls
`ensureNotificationPermission()`, which checks `Notifications.getPermissionsAsync()`
and, if not already granted, calls `Notifications.requestPermissionsAsync()` —
a real OS permission prompt. If the user declines, the toggle silently stays
off. If granted, the reminder is scheduled and the returned notification ID is
stored in `settings.reminders[key].notificationId`.

**Scheduling mechanism.** `scheduleDailyReminder(time, title, body)` calls
`Notifications.scheduleNotificationAsync` with a **`CALENDAR` trigger type and
`repeats: true`** — a genuine recurring daily local OS notification, not a
JS-side timer, so it fires even if the app isn't open. Toggling a reminder
**off** cancels its stored notification ID. Changing a reminder's time (or
changing bedtime, for Wind-Down) cancels the old notification and reschedules
a new one (`rescheduleDailyReminder`). This whole path correctly no-ops on
web, where `expo-notifications` doesn't support scheduling.

**Why the current build differs.** Earlier in this project's iteration, the
notification-permission code paths (and a since-fully-removed push-notification
token feature) were deliberately stripped at the user's explicit request, so
that the app requests no OS notification permission at all — the three
reminder toggles remain visible in Settings for continuity, but are currently
inert (stored preference only, no real delivery). This document exists to
preserve a complete record of how the feature was designed to work, since
that's a meaningful reference point for anyone re-enabling it later — the
original implementation lived in `src/notifications/permissions.ts`,
`handlers.ts`, and `scheduler.ts` (recoverable from git history at commit
`7f99292` and unchanged through `7a8c2e0`, which is also where the Wind-Down
reminder was added).

## 5. Design language summary

Full visual detail lives in the [design catalog](./design-catalog/index.html)
(see especially [tokens.html](./design-catalog/tokens.html)); this is the
short version.

- **Voice**: warm, gentle, encouraging — never clinical or gamified.
  Permission-giving copy ("Every bit of effort counts.") over prescriptive
  copy. Sentence case throughout; small all-caps reserved for eyebrow labels
  only. Short copy — headlines are a few words, no paragraphs of explanation.
  No emoji.
- **Color**: one dusk-purple + warm-accent palette (gold, blush, sage) shared
  by both themes — only surfaces and text invert between light/dark. Two
  families are theme-fixed: the CTA gradient and the "night" card surface
  (bedtime/sleep content always renders dusk-dark, regardless of app theme).
- **Type**: Quicksand throughout (500/600/700 weights), no secondary display
  face in the current app.
- **Shape**: everything rounded — 16–40px on cards, full pill (999px) on
  buttons/badges, plus one special asymmetric "organic" radius reserved for a
  single hero/quote element per screen.
- **Illustration**: hand-drawn-feeling flat SVGs (moon mascot, cloud-sheep,
  bedtime crescent, wake-up sun) — never photographic or 3D.
