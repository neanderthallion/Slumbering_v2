/**
 * English source strings for Slumbering.
 *
 * How to make a Vietnamese version:
 *   1. Copy this file to `strings.vi.js`.
 *   2. Replace every value with its Vietnamese translation. Keep the keys,
 *      the array lengths/order, and any {{placeholder}} tokens unchanged.
 *   3. Change the `module.exports` line at the bottom of your copy to
 *      `module.exports = { locale: 'vi', strings: { ... } };` (or just keep
 *      the same shape — whatever's convenient for whoever wires it up).
 *
 * Notes on structure:
 *   - Keys are flat dot-notation strings grouped by screen/area, with a
 *     shared "common.*" and "goalCategory.*"/"goalBank.*" namespace for
 *     strings reused across multiple screens (translate those once).
 *   - A value that is an ARRAY is a random-pick "message pool" from
 *     src/data/companionMessages.ts — the app shows one random line from
 *     the array per day, never the same line two days running. Translate
 *     every item; you may add more variants later (array can grow).
 *   - A value containing {{likeThis}} is built dynamically in code (a
 *     count, a name, a nested label). Keep the token, translate the
 *     surrounding words, and feel free to reorder the token within the
 *     sentence if Vietnamese word order requires it.
 *   - This file is NOT wired into the app yet — it's a translation source
 *     only. Swapping the app's hardcoded strings for these keys (with an
 *     i18n library) is a separate follow-up task.
 */

module.exports = {
  // ===========================================================================
  // common — shared across multiple screens
  // ===========================================================================
  'common.appName': 'Slumbering',
  'common.nav.home': 'Home', // "back to Home" link on Settings, Journey, Goal Picker, Tonight Confirmation, Check-In
  'common.action.cancel': 'Cancel',
  'common.action.confirm': 'Confirm',
  'common.action.save': 'Save',
  'common.action.edit': 'Edit',
  'common.action.done': 'Done', // web time-picker "Done" button
  'common.action.import': 'Import',
  'common.action.yes': 'Yes', // check-in Yes/No pill toggle
  'common.action.no': 'No',
  'common.arrowGlyph': '→', // decorative but present as literal text in several link rows
  'common.am': 'AM', // web time-picker
  'common.pm': 'PM',
  'common.theme.light': 'Light', // NOTE: code currently renders the raw enum value ("light"/"dark")
  'common.theme.dark': 'Dark', //       with CSS capitalize — wiring this key in needs a small code change.

  // ===========================================================================
  // goalCategory — shared category tab labels (Goal Picker, Journey filters)
  // ===========================================================================
  'goalCategory.bedtime': 'Bedtime',
  'goalCategory.windDown': 'Wind-down',
  'goalCategory.relaxation': 'Relaxation',

  // ===========================================================================
  // goalBank — default/suggested goal CONTENT (editable seed data, not just chrome)
  // ===========================================================================
  'goalBank.bedtime': ['Sleep before 11:00 PM', 'Be in bed by 10:45 PM', 'Wake up at 6:30 AM'],
  'goalBank.windDown': [
    'Put away all digital devices 30 minutes before bed',
    'Avoid caffeine after 5:00 PM',
  ],
  'goalBank.relaxation': [
    'Read 10 pages before bed',
    'Practice breathing or meditation for 5 minutes before bed',
  ],
  // NOTE: worded slightly differently from goalBank.windDown[0] in source (src/data/settings.ts's
  // DEFAULT_NIGHT_PLAN vs src/data/suggestedGoals.ts) — same intent, two separate source strings
  // that won't naturally share one translation unless the code is reconciled first.
  'goalBank.defaultNightPlan': ['Sleep before 11:00 PM', 'Put away devices 30 minutes before bed'],

  // ===========================================================================
  // onboarding
  // ===========================================================================
  'onboarding.eyebrow': 'Welcome',
  'onboarding.title': "Let's set up Slumbering",
  'onboarding.nameLabel': 'What should we call you?',
  'onboarding.namePlaceholder': 'Your name',
  'onboarding.nameHint':
    'Used to personalize your greetings. Optional — you can add or change this later in Settings.',
  'onboarding.themeLabel': 'Theme',
  'onboarding.accentLabel': 'Accent color',
  'onboarding.getStarted': 'Get started',

  // ===========================================================================
  // home
  // ===========================================================================
  'home.bedtimeSchedule.title': 'Bedtime schedule',

  'home.goalsStatus.noGoalsSetTitle': 'Pick your goals for tonight',
  'home.goalsStatus.noGoalsSetSubtitle': 'Takes less than a minute',
  'home.goalsStatus.checkInDueTitle': 'Did you achieve your goals?',
  'home.goalsStatus.checkInDueSubtitleTemplate': '{{count}} goal(s) to review',
  'home.goalsStatus.bothDoneTitle': 'All set for tonight.',
  'home.goalsStatus.bothDoneSubtitle': 'Come back tomorrow to continue your journey.',
  'home.goalsStatus.editGoals': 'Edit goals',

  // Greeting pools (src/data/companionMessages.ts GREETING_POOLS) — one random pick each.
  // Combined in code with the user's name; word order may need to change per-language.
  'home.greeting.firstTime': ['Welcome'],
  'home.greeting.morning': ['Good morning'],
  'home.greeting.afternoon': ['Good afternoon'],
  'home.greeting.evening': ['Good evening'],
  'home.greeting.returning': ['Welcome back'],
  'home.greeting.withNameTemplate': '{{greeting}}, {{name}}!',
  'home.greeting.withoutNameTemplate': '{{greeting}}!',

  // Companion message pools (COMPANION_POOLS) — one random pick per pool, never repeats
  // two days running (see src/data/companionMessages.ts pickFromPool).
  'home.message.firstTime': ['Start with a goal that feels achievable.', 'Ready to begin?'],
  'home.message.returning': [
    "Let's pick up where you left off.",
    'Glad to see you again.',
    "Your journey is still here whenever you're ready.",
    'Thanks for coming back.',
    "It's never too late to begin again.",
  ],
  'home.message.streak3to6': ["You're building momentum.", "You're creating a healthy rhythm.", 'Keep it up!'],
  'home.message.streak7': ['A whole week of consistency.', '7 days of great work!', 'One week strong!'],
  'home.message.streak30': ['A month-long streak. Amazing work!', '30 days of consistency. Keep it up!'],
  'home.message.goalStatusAllAchieved': [
    'You kept your promise to yourself tonight.',
    'Another successful night recorded.',
    'Well done. See you tomorrow!',
  ],
  'home.message.goalStatusPartial': [
    'Your effort today matters.',
    'Every bit of effort counts.',
    'Small wins are still wins.',
  ],
  'home.message.goalStatusNone': ['Tomorrow is another opportunity.'],
  'home.message.default': [
    'Hope today treats you well.',
    'May tonight be in your favor.',
    "Ready for tonight's goals?",
    "Let's make tonight count.",
    'Thanks for stopping by.',
  ],
  'home.message.majorMilestoneTemplate': '{{count}} successful nights!',

  // Today's-action pools (TODAYS_ACTION_POOLS)
  'home.todaysAction.newUser': ['Set your first sleep goal.'],
  'home.todaysAction.beforeGoals': [
    'What do you want to try for tonight?',
    'How would you like to achieve tonight?',
  ],
  'home.todaysAction.afterGoalsSameDay': ["You're all set for tonight.", 'Good luck!'],
  'home.todaysAction.beforeCheckInNextDay': ['How did last night go?'],

  // Home's journey preview card (empty/fallback states — worded slightly differently
  // from the full Journey screen's equivalents below; flagged, not reconciled here)
  'home.journeyPreview.emptyState': 'Your journey starts tonight.',
  'home.journeyPreview.milestoneFallback': 'Keep going, your first milestone is on its way.',

  // ===========================================================================
  // goalPicker
  // ===========================================================================
  'goalPicker.title': 'Pick your goals for tonight',
  'goalPicker.selectedCountTemplate': '{{count}} of {{max}} selected',
  'goalPicker.customInput.placeholder': 'Add your own...',
  'goalPicker.customInput.addButton': 'Add',
  'goalPicker.disclaimer.message':
    'Sleep experts generally recommend an earlier bedtime. Would you like to continue with this goal?',
  'goalPicker.confirmGoals': 'Confirm goals',

  // ===========================================================================
  // tonightConfirmation
  // ===========================================================================
  'tonightConfirmation.title': "Tonight's goals are",
  'tonightConfirmation.footerNote': "Rest well tonight. We'll check in tomorrow.",
  'tonightConfirmation.toast.saved': 'Goals saved for tonight',

  // ===========================================================================
  // checkIn
  // ===========================================================================
  'checkIn.title': 'Did you achieve your goals?',
  'checkIn.toast.saved': 'Check-in saved',

  // ===========================================================================
  // journey
  // ===========================================================================
  'journey.eyebrow': 'Your journey',
  'journey.title': 'The last few nights',
  'journey.nightsLoggedTemplate': '{{count}} night(s) logged so far',
  'journey.emptyState': 'No nights logged yet. Once you check in, your journey will appear here.',
  'journey.headlineFallback': 'Your journey starts here.',
  'journey.headlineAllAchieved': "You're building a great routine.",
  'journey.headlinePartial': 'Progress, not perfection.',
  'journey.headlineNone': 'Welcome back. Ready to continue?',

  'journey.addPastRecord.title': 'Add a past record',
  'journey.addPastRecord.dateLabel': 'Date',
  'journey.addPastRecord.datePlaceholderDay': 'DD',
  'journey.addPastRecord.datePlaceholderMonth': 'MM',
  'journey.addPastRecord.datePlaceholderYear': 'YY',
  'journey.addPastRecord.setDate': 'Set date',
  'journey.addPastRecord.didYouAchieve': 'Did you achieve these?',
  'journey.addPastRecord.invalidDate': 'Enter a valid date (dd/mm/yy)',
  'journey.addPastRecord.dateNotBeforeToday': 'Pick a date before today',
  'journey.addPastRecord.saved': 'Past record added',

  'journey.entry.addedLaterSuffix': ' · added later', // appended after the date, e.g. "Jul 24, 2026 · added later"

  // ===========================================================================
  // settings
  // ===========================================================================
  'settings.title': 'Settings',
  'settings.section.profile': 'Profile',
  'settings.section.reminders': 'Reminders',
  'settings.section.defaultNightPlan': 'Default night plan',
  'settings.section.appearance': 'Appearance',
  'settings.section.backupRestore': 'Backup & restore',
  'settings.section.appInfo': 'App information',

  'settings.profile.namePlaceholder': 'Your name',

  'settings.reminders.setGoals.label': 'Set goals reminder',
  'settings.reminders.setGoals.notificationBody': 'Time to choose your sleep goals for tonight.',
  'settings.reminders.checkIn.label': 'Check-in reminder',
  'settings.reminders.checkIn.notificationBody': "How did you do with last night's goals?",

  'settings.appearance.themeLabel': 'Theme',
  'settings.appearance.accentLabel': 'Accent',
  'settings.appearance.textSizeLabel': 'Text size',
  'settings.appearance.textSize.small': 'Small',
  'settings.appearance.textSize.medium': 'Medium',
  'settings.appearance.textSize.large': 'Large',

  'settings.backup.exportLabel': 'Export backup',
  'settings.backup.importLabel': 'Import backup',
  'settings.backup.shareDialogTitle': 'Export Slumbering backup',
  'settings.backup.confirmTitle': 'Replace current data?',
  'settings.backup.confirmMessage': 'Importing will replace all current goals, journey history, and settings.',
  'settings.backup.confirmMessageWeb':
    'Importing will replace all current goals, journey history, and settings. Continue?',
  'settings.backup.toast.exportSuccess': 'Backup exported',
  'settings.backup.toast.exportError': 'Could not export backup',
  'settings.backup.toast.invalidJson': 'That file is not valid JSON',
  'settings.backup.toast.invalidShape': "That file doesn't look like a Slumbering backup",
  'settings.backup.toast.importSuccess': 'Backup restored',
  'settings.backup.toast.importError': 'Could not import backup',

  'settings.appInfo.versionLabel': 'Version',
  'settings.appInfo.links.sleepScience': 'Sleep science references',
  'settings.appInfo.links.termsOfService': 'Terms of service',
  'settings.appInfo.links.contactUs': 'Contact us',
  'settings.appInfo.links.feedback': 'Feedback',
  // NOTE: current code builds this toast as `Opening ${label.toLowerCase()}`, re-deriving it
  // from the (English) link label at runtime instead of using a separate template — it will
  // silently stay in English after translation unless that's changed to interpolate this
  // template with the already-translated label instead.
  'settings.appInfo.toast.openingTemplate': 'Opening {{label}}',
};
