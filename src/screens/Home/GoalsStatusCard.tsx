import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card } from '../../components/Card';
import { NightRecord } from '../../types/models';
import { DailyStage } from '../../data/selectors';

interface Props {
  stage: DailyStage;
  todayRecord: NightRecord | undefined;
  onPressCta: () => void;
  onEditGoals: () => void;
}

export function GoalsStatusCard({ stage, todayRecord, onPressCta, onEditGoals }: Props) {
  const { theme } = useTheme();

  if (stage === 'bothDone') {
    return (
      <Card>
        <Text style={{ fontFamily: theme.fonts.displayItalic, fontSize: 16 * theme.textScale, color: theme.colors.textHi }}>
          All set for tonight.
        </Text>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 13 * theme.textScale, color: theme.colors.textMid, marginTop: 4 }}>
          Come back tomorrow to continue your journey.
        </Text>
      </Card>
    );
  }

  const isCheckIn = stage === 'checkInDue';
  const label = isCheckIn ? 'Did you achieve your goals?' : "Pick your goals for tonight";
  const sub = isCheckIn
    ? `${todayRecord?.goals.length ?? 0} goal${(todayRecord?.goals.length ?? 0) > 1 ? 's' : ''} to review`
    : 'Takes less than a minute';

  return (
    <View>
      <Pressable
        onPress={onPressCta}
        style={({ pressed }) => [
          styles.cta,
          { backgroundColor: theme.colors.accent, opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: theme.fonts.display, fontSize: 18 * theme.textScale, color: theme.colors.accentContrastText }}>
            {label}
          </Text>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 12 * theme.textScale, color: theme.colors.accentContrastText, opacity: 0.8, marginTop: 3 }}>
            {sub}
          </Text>
        </View>
        <Text style={{ fontSize: 20, color: theme.colors.accentContrastText }}>{'→'}</Text>
      </Pressable>

      {isCheckIn && todayRecord && (
        <Card style={styles.goalsCard}>
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
            <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 12.5 * theme.textScale, color: theme.colors.accent }}>
              Edit goals
            </Text>
          </Pressable>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 26,
    padding: 20,
    marginBottom: 14,
  },
  goalsCard: {
    marginTop: -2,
  },
});
