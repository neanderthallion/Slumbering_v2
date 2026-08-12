# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

## Users

Primary users are students who already know healthy sleep habits (regular
bedtime, wind-down routines, limiting late caffeine/screens) but struggle to
apply them consistently. They are not looking to learn sleep science or be
monitored — they want a low-friction way to commit to one small nightly goal
and get gentle acknowledgment the next morning. Scoped to this single primary
audience; no secondary audience (e.g. shift workers, general adults) is in
scope.

## Product Purpose

Slumbering is a minimalist sleep-habit companion. Each night the user
self-selects 1–2 small sleep goals; each morning a quick check-in records
whether they kept them. Progress is reflected back through a gentle,
encouraging voice, a moon-phase journey timeline, and a small badge system —
never through streak-shaming or punitive scoring. Success is a user
completing their entire daily interaction in well under 5 minutes, and being
able to return after a lapse of any length without friction or guilt-based
messaging.

## Positioning

Where mainstream sleep apps compete on extensive tracking, sensor/wearable
integration, and complex analytics or prescriptive coaching — which becomes
overwhelming and gets abandoned — Slumbering deliberately does none of that.
Its mechanism is user-owned, minimal commitment (one or two self-chosen goals
a night) paired with unconditionally positive framing of every return to the
app. A neighboring "sleep tracker" app could not truthfully copy this
positioning without dropping its own tracking/analytics core.

## Operating Context

Single daily interaction cycle, twice a day: set 1–2 goals for tonight
(categories: Bedtime, Wind-down, Relaxation, or free-text custom), then next
morning a "did you keep to plan?" check-in (yes/no gate, with optional actual
time entry only on "no"). A separate Add-Past-Record flow allows backfilling
a missed day. A read-only Bedtime Schedule panel and Bedtime analytics page
show target bedtime/wake time and derived sleep duration/regularity — display
only, no device automation. Local push reminders (set-goals, check-in,
wind-down) via real OS notifications nudge the two daily moments. Settings
supports local JSON export/import (backup/restore) via the OS share sheet —
no account, no cloud sync.

## Capabilities and Constraints

- Local-first: all state lives on-device (AsyncStorage via Zustand
  `persist`); there is no backend, no network client, and none is planned.
- Real local notifications for the two/three daily reminders
  (`expo-notifications` scheduling, not just preference storage).
- No OS-level device automation: no Do Not Disturb, brightness, or
  always-on-display control. Evaluated and deliberately dropped as
  infeasible cross-platform even for Android alone (native module + EAS
  build cost is out of scope for this solo-maintained, minimalist app).
- No detailed sleep tracking, no wearable/sensor integration, no
  sleep-stage or quality scoring — check-in is a simple per-goal yes/no
  (or a "not as planned" delta captured only when the user says so).
- No punitive streak mechanics, guilt-based copy, or negative scoring
  anywhere in the product; a missed goal is never framed as failure.
- No social/sharing features, leaderboards, or multi-user accounts.
- Accent color per theme is a fixed design-time token, not user-configurable.
- No specific accessibility standard is mandated beyond ordinary mobile
  best practice (contrast, touch target size, screen reader labels) — no
  named user need or formal target (e.g. WCAG level) has been set.
- Build target is Android only for this codebase, despite the product
  having originally been conceived and partly built as a cross-platform
  Expo app (iOS/Android/web) — that scope was deliberately narrowed; do
  not treat iOS/web behavior as in scope without an explicit new request.

## Brand Commitments

- Product name: Slumbering.
- Voice: sentence case, no emoji, short headline copy, a permission-giving
  tone ("Every bit of effort counts.") — never clinical, prescriptive, or
  guilt-based. Hard-banned phrasing: "You failed," "Your streak is broken,"
  "You missed your goal."
- Visual identity (palette, typography, iconography) is an existing,
  evolving implementation, currently recorded only in the `design-catalog/`
  HTML catalog, not yet in a DESIGN.md — treat the current catalog/code as
  incumbent evidence, subject to replacement per an explicit redesign
  request, not as a fact to restate here.

## Evidence on Hand

Pre-launch: no real users, store listing, feedback, ratings, or usage data
exist yet. Future work must not fabricate testimonials, user counts,
ratings, or screenshots presented as real.

## Product Principles

1. Companion, not instructor — encourage and acknowledge; never instruct,
   block, or force compliance. Science-backed suggestions are nudges the
   user can always override.
2. Minimalist by design — one short interaction at night, one in the
   morning; nothing in the product should demand more than a few minutes
   of a user's day.
3. User autonomy over prescribed programs — the user picks their own goals
   from suggestions or free text; the app never imposes a program.
4. Every return is a positive action — a lapse of any length is met with
   neutral-to-positive re-engagement copy, never a guilt or recovery frame.
5. Local-first and account-free — no backend, no login, no cloud dependency;
   the user's data and its portability (export/import) stay entirely in
   their control.

## Accessibility & Inclusion

No product-specific accessibility requirement or named user need has been
established beyond standard mobile best practice (sufficient contrast,
adequately sized touch targets, screen-reader-usable labels).
