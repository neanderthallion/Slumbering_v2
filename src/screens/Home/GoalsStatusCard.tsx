import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../../components/Card';
import { NightRecord } from '../../types/domain';
import { DailyStage } from '../../features/companion-messages/logic/pickMessage';
import { COPY, fmt } from '../../copy';

interface Props {
  stage: DailyStage;
  /** Only meaningful when stage === 'checkInDue': false while it's still the same evening the goals were set (nothing to check in on yet), true once it's the next day and check-in is actually available. */
  readyToCheckIn: boolean;
  todayRecord: NightRecord | undefined;
  onPressCta: () => void;
  onEditGoals: () => void;
}

export function GoalsStatusCard({ stage, readyToCheckIn, todayRecord, onPressCta, onEditGoals }: Props) {
  const { theme } = useTheme();

  const hasOpenGoals = stage === 'checkInDue';
  const showCta = stage === 'noGoalsSet' || readyToCheckIn;
  const label = readyToCheckIn ? COPY.home.goalsStatus.checkInQuestion : COPY.home.goalsStatus.pickGoals;
  const sub = readyToCheckIn
    ? fmt(COPY.home.goalsStatus.goalsToReview, { count: todayRecord?.goals.length ?? 0 })
    : COPY.home.goalsStatus.takesLessThanMinute;

  return (
    <View>
      {showCta && (
        <Pressable onPress={onPressCta} style={({ pressed }) => [styles.ctaShadow, theme.shadows.cta, { opacity: pressed ? 0.94 : 1 }]}>
          <LinearGradient
            colors={[theme.colors.ctaGradientFrom, theme.colors.ctaGradientVia, theme.colors.ctaGradientTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.4 }}
            style={styles.cta}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 17.5 * theme.textScale, color: theme.colors.ctaText }}>{label}</Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5 * theme.textScale, color: theme.colors.ctaText, opacity: 0.8, marginTop: 3 }}>{sub}</Text>
            </View>
            <Text style={{ fontSize: 22, color: theme.colors.ctaText }}>→</Text>
          </LinearGradient>
        </Pressable>
      )}

      {hasOpenGoals && todayRecord && (
        <Card style={styles.goalsCard}>
          <Text
            style={{
              fontFamily: theme.fonts.bodyBold,
              fontSize: 11 * theme.textScale,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              color: theme.colors.textLow,
              marginBottom: 10,
            }}
          >
            {COPY.home.goalsStatus.tonightsGoals}
          </Text>
          {todayRecord.goals.map((g, i) => (
            <Text
              key={g.goalId}
              style={{
                fontFamily: theme.fonts.body,
                fontSize: 14 * theme.textScale,
                color: theme.colors.textHi,
                marginBottom: i === todayRecord.goals.length - 1 ? 0 : 6,
              }}
            >
              {'•'} {g.label}
            </Text>
          ))}
          <Pressable onPress={onEditGoals} style={{ marginTop: 10 }}>
            <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 12.5 * theme.textScale, color: theme.colors.accent }}>{COPY.home.goalsStatus.edit}</Text>
          </Pressable>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ctaShadow: {
    borderRadius: 999,
    marginBottom: 14,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 999,
    padding: 22,
  },
  goalsCard: {
    marginTop: -2,
  },
});
