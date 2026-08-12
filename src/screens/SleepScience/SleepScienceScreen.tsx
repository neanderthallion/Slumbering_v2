import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../theme/ThemeProvider';
import { ScreenContainer } from '../../components/ScreenContainer';
import { RootStackParamList } from '../../app/navigation.types';

type Block = { type: 'p'; text: string } | { type: 'item'; label: string; text: string };

interface Section {
  heading: string;
  blocks: Block[];
}

const SECTIONS: Section[] = [
  {
    heading: '1. The Core Premise: Psychology and Sleep Science',
    blocks: [
      {
        type: 'p',
        text: 'Modern society faces a paradox: millions of young adults suffer from insufficient or inconsistent sleep despite widespread knowledge of its importance. The Slumbering app is built on a specific scientific premise: behavior change in sleep is most sustainable when driven by user autonomy, micro-commitments, and psychological safety, rather than surveillance and algorithmic control.',
      },
      {
        type: 'p',
        text: 'Traditional sleep and wellness apps often rely on exhaustive tracking, sleep-stage sensors, and prescriptive coaching. From a psychological standpoint, this backfires for several reasons:',
      },
      {
        type: 'item',
        label: 'The "Quantified Self" Anxiety',
        text: 'Detailed tracking can induce orthosomnia—an unhealthy preoccupation with achieving "perfect" sleep metrics. High anxiety directly stimulates hyperarousal, activating the sympathetic nervous system and worsening insomnia.',
      },
      {
        type: 'item',
        label: 'The Fatigue of Surveillance',
        text: 'Requiring users to wear devices, log complex variables, or adhere to rigid, unyielding schedules creates cognitive fatigue. Users quickly abandon apps that feel like a second job.',
      },
      {
        type: 'item',
        label: 'Shame and the Extinction Burst',
        text: 'When traditional apps use punitive metrics or broken-streak shaming ("You missed 3 days!"), they trigger psychological reactance and feelings of failure. Users respond by abandoning the app altogether to escape negative reinforcement.',
      },
      {
        type: 'p',
        text: 'Slumbering bypasses these pitfalls by aligning with Self-Determination Theory (SDT) and cognitive behavioral principles for sleep hygiene.',
      },
    ],
  },
  {
    heading: '2. Mechanisms of Action: How the Features Work',
    blocks: [
      { type: 'p', text: 'Every feature in the app is mapped to a deliberate psychological or behavioral mechanism:' },
      {
        type: 'item',
        label: 'A. User Autonomy and 1–2 Goal Caps',
        text: 'The Science: Self-Determination Theory highlights three basic psychological needs—autonomy, competence, and relatedness. By letting users choose their own 1–2 goals nightly (spanning Bedtime, Unwind, or Relaxation categories) rather than forcing an imposed program, the app fosters deep intrinsic motivation.\n\nThe Mechanism: Cognitive load theory dictates that asking people to change multiple deep-seated habits simultaneously leads to failure. Limiting choices to one or two micro-goals reduces friction, making behavioral enactment highly achievable.',
      },
      {
        type: 'item',
        label: 'B. The Anti-Shame Companion Philosophy',
        text: 'The Science: Behavioral psychology shows that positive reinforcement drastically outperforms punishment in maintaining long-term habits. Psychological safety is essential for habit re-engagement after a lapse.\n\nThe Mechanism: The app implements a strict "no-shame" rule (banning phrases like "You failed" or "Streak broken"). Every return is welcomed neutrally or positively ("Welcome back. Ready to continue?"). This eliminates the emotional barrier and guilt associated with missing a day, paving the way for immediate behavioral recovery instead of prolonged avoidance.',
      },
      {
        type: 'item',
        label: 'C. The Connected-Dot Journey Timeline over Data Dashboards',
        text: 'The Science: Clinical sleep interventions (like CBT-I) emphasize reflective tracking over hyper-fixation on numerical data.\n\nThe Mechanism: Utilizing a connected-dot graph (gold for fully achieved, blush for partial, outline for none) paired with an all-time success-rate ring chart turns the history view into a personal reflective journal rather than a stressful performance dashboard. It allows users to observe broad macroscopic trends in consistency without obsessing over microscopic data points.',
      },
      {
        type: 'item',
        label: 'D. Frictionless Next-Day Check-Ins',
        text: 'The Science: Habit loops rely on a Cue, a Routine, and a Reward. If the routine of logging data is too complex, the habit loop collapses.\n\nThe Mechanism: The morning-after check-in is restricted to a simple per-goal Yes/No binary. By keeping the interaction under 5 minutes, it minimizes response effort and preserves user engagement.',
      },
      {
        type: 'item',
        label: 'E. Stripping Out Device Automation and Sleep Modes',
        text: 'The Science: Technical friction and cross-platform fragmentation (especially strict OS constraints on iOS regarding Do Not Disturb, brightness, and system dark mode) often lead to buggy user experiences.\n\nThe Mechanism: By consciously dropping complex system-level automation in favor of a lightweight, display-only Bedtime Schedule panel, the app focuses purely on psychological priming and visual awareness rather than technical enforcement.',
      },
    ],
  },
  {
    heading: '3. Anticipated Impacts on Young Adults',
    blocks: [
      {
        type: 'p',
        text: 'Young adults experience unique vulnerabilities in circadian biology—specifically, a natural delayed phase preference ("night owl" tendencies) compounded by late-night digital media use. The design of Slumbering targets these vulnerabilities effectively:',
      },
      {
        type: 'item',
        label: 'Reduction of Sleep Performance Anxiety',
        text: 'Because there are no wearable sensors scoring "sleep quality," users are relieved of the pressure to try to sleep—a known cognitive trigger for sleep-onset insomnia.',
      },
      {
        type: 'item',
        label: 'Sustained Long-Term Consistency',
        text: 'By prioritizing micro-commitments over rigid overhauls, users gradually shift their circadian baseline earlier through sustainable, self-directed adjustments.',
      },
      {
        type: 'item',
        label: 'Resilience Against Relapse',
        text: 'Lapses are treated as data points rather than moral failures. This resilience is the single greatest predictor of whether a young adult will maintain long-term health routines over months and years, rather than abandoning them after a stressful week of exams or social events.',
      },
    ],
  },
  {
    heading: 'Sources',
    blocks: [
      { type: 'p', text: "1. American Psychological Association (2020) Schools shift as evidence mounts that later start times improve teens' learning and well-being. Available at: American Psychological Association (Accessed: August 2026)." },
      { type: 'p', text: "2. Creswell, J.D., Tumminia, M.J., Price, S., Cohen, S., Sefidgar, Y., Ren, Y., Brown, J., Dey, A.K., Dutcher, J.M., Villalba, D., Mankoff, J., Xu, X., Creswell, K., Doryab, A., Mattingly, S., Striegel, A., Martinez, G., Hachen, D. and Liu, M.C. (2023) 'Nightly sleep duration predicts grade point average in the first year of college', Proceedings of the National Academy of Sciences, 120(8), e2209123120. doi: 10.1073/pnas.2209123120." },
      { type: 'p', text: "3. Hershner, S.D. and Chervin, R.D. (2014) 'Causes and consequences of sleepiness among college students', Nature and Science of Sleep, 6, pp. 73–84. doi: 10.2147/NSS.S62907." },
      { type: 'p', text: "4. Misra, R., Divyanshi, S., Jahanvi, S., Akanksha, M. and Rajgopal, R. (2025) 'Effect of sleep deprivation on executive functioning among young adults: Meta-analysis', Open Journal of Psychology, 5, pp. 79–87. doi: 10.31586/ojp.2025.6215." },
      { type: 'p', text: "5. National Sleep Foundation (2026) The critical connection between teens' sleep and mental health. Available at: National Sleep Foundation (Accessed: August 2026)." },
      { type: 'p', text: "6. National Sleep Foundation (2015) National Sleep Foundation's sleep time duration recommendations: Methodology and results summary (Hirshkowitz, M. et al.). Sleep Health." },
      { type: 'p', text: "7. University of Michigan College of LSA (n.d.) A college student's guide to sleeping. University of Michigan Student Life." },
      { type: 'p', text: "8. UC Berkeley Research (n.d.) An afternoon nap markedly boosts the brain's learning capacity. University of California, Berkeley." },
    ],
  },
];

export function SleepScienceScreen() {
  const { theme } = useTheme();
  // Only ever reached from Settings, so it goes back rather than home -- per
  // CLAUDE.md §3 this is one of the two hardcoded goBack() exceptions and is
  // deliberately not routed through the shared BackRow component.
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScreenContainer>
      <Pressable onPress={() => navigation.goBack()} style={styles.backRow}>
        <Ionicons name="chevron-back" size={16} color={theme.colors.textMid} />
        <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 13 * theme.textScale, color: theme.colors.textMid }}>
          Back
        </Text>
      </Pressable>

      <Text style={{ fontFamily: theme.fonts.display, fontSize: 24 * theme.textScale, color: theme.colors.textHi, marginBottom: 18 }}>
        Sleep science references
      </Text>

      {SECTIONS.map((section) => (
        <View key={section.heading} style={styles.section}>
          <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 16 * theme.textScale, color: theme.colors.textHi, marginBottom: 10 }}>
            {section.heading}
          </Text>
          {section.blocks.map((block, i) =>
            block.type === 'p' ? (
              <Text
                key={i}
                style={{ fontFamily: theme.fonts.body, fontSize: 13.5 * theme.textScale, color: theme.colors.textMid, lineHeight: 20, marginBottom: 10 }}
              >
                {block.text}
              </Text>
            ) : (
              <View key={i} style={styles.item}>
                <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 13.5 * theme.textScale, color: theme.colors.textHi, marginBottom: 3 }}>
                  {block.label}
                </Text>
                <Text style={{ fontFamily: theme.fonts.body, fontSize: 13.5 * theme.textScale, color: theme.colors.textMid, lineHeight: 20 }}>{block.text}</Text>
              </View>
            )
          )}
        </View>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
  section: { marginBottom: 22 },
  item: { marginBottom: 12 },
});
