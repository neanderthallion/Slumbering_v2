# Slumbering — Product Requirements Document

## 1. Overview

Slumbering is a minimalist sleep-habit companion app for mobile Android, built on Expo/React Native. Each night the user picks one or two small, self-chosen sleep goals; each morning they do a quick check-in on whether they hit them. The app reflects progress back through a gentle, encouraging voice and a connected-dot-graph journey timeline — never through streak-shaming or punitive scoring. A simple Bedtime Schedule panel keeps the user's target bedtime, wake-up time, and resulting sleep duration visible as a reminder, with no device automation involved.

## 2. Problem & Aim

**Problem.** Many students experience insufficient or inconsistent sleep despite knowing healthy sleep habits. Existing sleep apps often lean on extensive tracking, complex analytics, or prescriptive coaching — which becomes overwhelming and gets abandoned quickly.

**Aim.** Build a minimalist sleep companion that helps students build healthier sleep habits through self-selected goals, gentle encouragement, and long-term consistency, rather than surveillance or coaching. The underlying hypothesis: turning phones off and going to bed earlier increases sleep duration, and small, user-owned commitments sustain behavior change better than imposed programs.

## 3. Core Principles

- **Companion, not instructor.** The app encourages rather than instructs. It acknowledges progress, celebrates milestones, and welcomes users back after a lapse — never with guilt or punishment.
- **Minimalist experience.** A single daily interaction (set goals at night, check in in the morning) with a clean interface. The app should not need more than ~5 minutes of a user's day.
- **User autonomy.** Users choose which sleep habit to work on. The app may nudge with science-backed suggestions but never blocks or forces compliance.

## 4. Target Platform

- Expo-managed React Native app (Expo SDK 57), targeting iOS, Android, and web from one codebase.
- Local-first: state is device-local (AsyncStorage-backed settings/records); no backend/server component exists or is planned in this scope.
- Key native capabilities used: local notifications (`expo-notifications`), file export/import and the OS share sheet (`expo-file-system`, `expo-sharing`, `expo-document-picker`). No custom native modules or EAS development build are required — the app runs entirely on the standard Expo managed workflow.

## 5. Core Features

### 5.1 Home Screen — "Your Sleep Companion"

The main screen on open. Composed of three message layers plus a goals/journey summary:

1. **Greeting** — short, based on state: first-time user ("Welcome!"), time of day ("Good morning" / "Good afternoon" / "Good evening"), or returning after inactivity ("Welcome back").
2. **Companion message** — exactly one shown per day, chosen by the highest-priority matching condition:
   1. First-time user (e.g. "Start with a goal that feels achievable. Ready to begin?")
   2. Returning after inactivity (e.g. "Let's pick up where you left off.")
   3. Major milestone reached — nights-with-fully-achieved-goals count crosses **5 → 10 → 30 → 50 → 100 → 365**
   4. Weekly/streak milestone — **3–6 day**, **7–29 day**, and **30+ day** consecutive full-goal streaks each have their own message pool
   5. Goal status — shown only when the user has completed check-in but hasn't yet set tonight's goals; becomes highest priority in that situation
   6. Default encouragement (e.g. "May tonight be in your favor.")
   - Messages are chosen randomly from the matching pool. The same companion message must not repeat two days in a row unless it's the only one available for the current condition.
3. **Today's action** — depends only on where the user is in the daily cycle:
   - New user → "Set your first sleep goal."
   - Before setting goals (incl. right after check-in) → e.g. "What do you want to try for tonight?"
   - After setting goals, day-of → e.g. "You're all set for tonight. Good luck!"
   - Before check-in, the morning after → e.g. "How did last night go?"

Below the messages, the **goals/check-in card** changes with the daily cycle:
- No goals set yet → CTA "Pick your goals for tonight"
- Goals set, check-in not done → shows the goals with an "Edit goals" option and a "Did you achieve your goals?" check-in prompt
- Both done for the day → brief completion state, encouragement to return tomorrow

Below that, a **Recap card**: rolling week/month completion stats — a headline completion percentage, the change versus the previous period, tiles for current streak / average bedtime deviation / strongest goal category, and a one-line insight sentence naming whichever goal category is performing best that period. The user toggles between "Week" and "Month" views.

Below that, a **journey preview**: a connected dot graph plotting the last 7 nights (filled gold dot = all goals achieved, filled blush dot = partially achieved, outline dot = none/no record), plus either the most recent milestone line or a short logged-nights summary, with a link into the full Journey view.

### 5.2 Daily Goal-Setting Flow

Triggered from "Pick your goals for tonight."

- User selects **1–2 goals** for the night, organized into categories:
  - **Bedtime** (e.g. "Sleep before 11:00 PM", "Be in bed by 10:45 PM", "Wake up at 6:30 AM")
  - **Wind-down** (e.g. "Put away all digital devices 30 minutes before bed", "Avoid caffeine after 5:00 PM")
  - **Relaxation** (e.g. "Read 10 pages before bed", "Practice breathing or meditation for 5 minutes before bed")
  - **Add your own** — free-text custom goal
- A confirmation step shows "Tonight's goals are: …" before the user confirms; goals remain editable up to that point.
- If a goal looks unsupportive of healthy sleep (e.g. "Sleep before 3:00 AM"), the app never blocks it — it shows a gentle disclaimer ("Sleep experts generally recommend an earlier bedtime. Would you like to continue with this goal?") with **Continue** / **Change goal**. The user always keeps final control.

### 5.3 Next-Day Check-In

- The following day, the user sees "Did you achieve your goals?" with a simple per-goal Yes/No (or checkbox) input — no detailed sleep data entry.
- Must stay extremely short and frictionless by design.
- On confirm, the app returns to Home and updates the companion message/state.
- A separate **Add a Past Record** flow (accessible from a calendar icon on the Journey screen) lets the user retroactively fill in or edit a night they missed, without needing to go through the live goal-setting → check-in cycle.

### 5.4 Supportive Companion Feedback

- Positive-state messages (e.g. "You stayed consistent this week!", "You've achieved your goals for 50 nights.", "You're building a great routine.") appear when the user is doing well.
- Lapse/return messages are always neutral-to-positive (e.g. "Welcome back. Ready to continue?").
- **Hard rule:** the app must never shame, punish, or negatively score missed days. Banned phrasing includes "You failed," "Your streak is broken," "You missed your goal." Every return to the app is treated as a positive action, not a recovery from failure.

### 5.5 Journey Timeline

- A chronological, scrollable record — designed to feel like a personal reflective journal, not a data dashboard.
- At the top, an **all-time summary**: total nights logged, total nights fully successful, and a success-rate ring chart — the only all-time (not rolling-window) stat shown anywhere in the app.
- Below that, the same **connected dot graph** used in the Home preview, for the last 7 nights.
- Then the **entry list**: each entry shows date, the 1–2 goals for that night, per-goal achievement status (● achieved / ○ not achieved), and milestone entries interleaved where applicable (e.g. "10 successful nights").
- A calendar-icon control lets the user jump to any past date to add or edit a record.

### 5.6 Reminder Notifications

Three configurable local reminders, each with its own on/off switch:
- **Set-goals reminder** — e.g. "Time to choose your sleep goals for tonight," default 9:00 PM, time independently editable.
- **Check-in reminder** — e.g. "How did you do with last night's goals?", default 8:00 AM, time independently editable.
- **Wind-down reminder** — e.g. "It's nearly bedtime. Ready to wind down?" Its time is not independently set: it's automatically derived from the Bedtime Schedule panel's bedtime (a fixed offset before it), and the UI always displays "10 min before bedtime" rather than a picked time.

### 5.7 Bedtime Schedule (Home Screen)

A lightweight panel on the Home screen — positioned below the daily message card and above the goals/check-in card — showing the user's intended bedtime and wake-up time plus the resulting sleep duration (e.g. "8h 00m"). Both times are editable inline using the app's existing time-picker component.

This is a plain visual reminder, not automation: it does not touch any phone-level setting, does not schedule its own notifications, and runs no background logic. It exists purely to keep the user's target sleep window visible at a glance. (See §7 for why this replaced a more ambitious device-automation "Sleep Mode.")

### 5.8 Backup & Restore

Local, account-free backup in Settings:
- **Export** serializes settings and the full journey (night records) to a JSON file and hands it to the OS share sheet (native) or triggers a browser download (web) — the user decides where it ends up: Dropbox, Drive, email, AirDrop, local disk.
- **Import** opens a file picker for a previously exported `.json`, validates its shape, asks for confirmation (since it replaces all current goals, journey history, and settings), and restores it.

No cloud account, OAuth, or third-party API integration — the app never talks to Dropbox or any backend directly.

## 6. Non-Goals / Out of Scope

- No detailed sleep tracking (no sleep stages, no wearable/sensor integration, no sleep-quality scoring) — check-in is a simple per-goal yes/no.
- No prescriptive coaching or forced compliance — suggestions are optional and always dismissible/editable.
- No punitive streak mechanics, guilt-based copy, or negative scoring anywhere in the product.
- No social/sharing features, leaderboards, or multi-user accounts in this scope.
- No backend sync/cloud account system — data lives on-device.
- No OS-level device automation (Do Not Disturb, system-wide brightness or dark mode, Always-on-Display, or a true background alarm). Evaluated and deliberately dropped — see §7. The Bedtime Schedule panel (§5.7) is display-only by design.

## 7. Current Implementation Status

This section reflects the actual state of the codebase (Expo SDK 57 app under `src/`), so gaps are tracked deliberately rather than discovered later.

**Fully implemented:**
- All 6 core screens: Home, Goal Picker, Tonight Confirmation, Check-In, Journey, Settings (`src/screens/*`), wired into a single native-stack navigator.
- Goal-setting flow with the 1–2 goal cap (`MAX_GOALS`), category tabs, custom goals, and the risky-bedtime disclaimer.
- Check-in flow, and the separate Add-Past-Record flow for backfilling.
- Recap card on Home (`src/screens/Home/RecapCard.tsx`) — rolling week/month completion rate, trend vs. the prior period, streak/avg-bedtime/strongest-category tiles, and a randomly-picked insight sentence naming the strongest goal category.
- Journey timeline: an all-time summary (success-rate ring chart + totals), a connected dot graph for the last 7 nights (also reused on Home in place of the earlier 3-phase moon-icon row), and a chronological entry list with interleaved milestones.
- Streak and milestone computation (`src/data/selectors.ts`, `src/constants/milestoneThresholds.ts`) matching the spec's 5/10/30/50/100/365-night majors and 3–6 / 7–29 / 30+ streak bands, feeding the companion-message system (`src/data/companionMessages.ts`).
- Reminder notifications (set-goals, check-in, wind-down) via `expo-notifications` — real local notifications, correctly no-op on web.
- Onboarding (name, theme) — functional, but currently a one-time gate rendered outside the navigation stack before first use, with **no way to re-enter onboarding from Settings** afterward. (The theme accent was previously user-selectable via a swatch picker; that feature was removed — accent is now a fixed, non-configurable value per light/dark theme.)
- Backup & Restore — local JSON export (via `expo-file-system` + `expo-sharing`, with a Blob-download fallback on web) and import (via `expo-document-picker`, with shape validation and a destructive-action confirmation before overwriting local data). No cloud account or OAuth involved.

### 7.1 Sleep Mode — evaluated and removed

The app previously had a full "Sleep Mode" feature (manual/automatic activation, a bedtime/wake schedule, and toggles for Dark Mode, Do Not Disturb, Lower Brightness, Silence Notifications, Turn off Always-on Display, plus a wake-up alarm with sound/vibration/snooze). A feasibility review found most of this either impossible on one platform or costly enough to not be worth it for a minimalist, cross-platform, solo-maintained app:

| Toggle | Verdict |
|---|---|
| System-wide Dark Mode | Impossible on both iOS and Android for a normal published app — no public API, no entitlement unlocks it. |
| Do Not Disturb | Android: achievable, but needs a native module, an EAS build (leaving Expo Go), and a manual one-time permission grant from the user. iOS: impossible — Apple exposes no third-party Focus/DND control API. |
| Turn off Always-on Display | Impossible on both platforms — requires a signature/system-level Android permission a published app cannot obtain, and no API exists on iOS. |
| Lower Brightness (background/system-wide) | Android: technically possible (`expo-brightness`'s experimental `setSystemBrightnessAsync` + a special permission grant), still needs an EAS build. iOS: impossible — no API to change brightness outside the app's own foreground session. |
| Silence Notifications (system-wide) | Same constraints as Do Not Disturb above. |
| Wake-up alarm (true background alarm) | Android: achievable with a native module + EAS build. iOS: stays notification-based regardless of engineering effort — a real alarm needs Apple's "Critical Alerts" entitlement, reserved for safety-critical app categories and unlikely to be granted here. |

Given four of six toggles are either fully blocked or Android-only with real native-module/EAS-build cost, Sleep Mode was removed entirely rather than shipped as a partially-working, platform-inconsistent feature. It's replaced by the **Bedtime Schedule** panel (§5.7): a plain, pure-JS, cross-platform display of the user's bedtime/wake time and computed sleep duration, with no device automation and no native dependencies.

## 8. Success Principles

Since this is a pre-metrics, indie-built product, success is framed qualitatively rather than by dashboard KPIs:
- A user can complete their entire daily interaction (set goals or check in) in well under 5 minutes.
- Users who lapse for days or weeks can return and immediately re-engage without friction or guilt-based messaging.
- No copy in the app ever frames a missed goal as failure.
- The journey view reads as a personal reflection, not a performance dashboard.

## 9. Open Questions

- Should onboarding be reachable again from Settings (e.g. to change name/theme via a proper flow rather than ad hoc settings toggles)?
- Should the Bedtime Schedule panel ever grow its own reminder notification (e.g. nudging at the configured bedtime), or should it stay purely visual as currently scoped?
- Is local export/import sufficient long-term, or should a future version add direct cloud sync (e.g. Dropbox OAuth) on top of it?
