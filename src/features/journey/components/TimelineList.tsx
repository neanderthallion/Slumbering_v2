import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { JourneyEntry as JourneyEntryType } from '../../../types/domain';
import { JourneyEntry } from './JourneyEntry';
import { MilestoneEntry } from './MilestoneEntry';
import { AchievementEntry } from './AchievementEntry';
import { RAIL_WIDTH } from './TimelineRail';
import { COPY } from '../../../copy';

interface Props {
  entries: JourneyEntryType[];
  /** Called with a night's date when its entry is tapped, to open it for editing. */
  onPressNight?: (date: string) => void;
}

export function TimelineList({ entries, onPressNight }: Props) {
  const { theme } = useTheme();
  return (
    <View style={styles.timeline}>
      {entries.length === 0 && (
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 13.5 * theme.textScale, color: theme.colors.textLow }}>
          {COPY.journey.timelineEmpty}
        </Text>
      )}
      {entries.length > 0 && <View style={[styles.rail, { backgroundColor: theme.colors.hairline }]} />}
      {entries.map((entry, i) => {
        if (entry.type === 'night')
          return (
            <JourneyEntry
              key={`n-${entry.record.date}`}
              record={entry.record}
              onPress={onPressNight ? () => onPressNight(entry.record.date) : undefined}
            />
          );
        if (entry.type === 'milestone') return <MilestoneEntry key={`m-${entry.date}-${i}`} text={entry.text} />;
        if (entry.type === 'engagementMilestone') return <AchievementEntry key={`e-${entry.date}-${i}`} text={entry.text} />;
        return null;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  timeline: { paddingTop: 4, position: 'relative' },
  rail: { position: 'absolute', top: 9, bottom: 9, left: RAIL_WIDTH / 2 - 1, width: 2 },
});
