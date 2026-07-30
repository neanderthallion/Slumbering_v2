import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../theme/ThemeContext';
import { useAppData } from '../../data/AppDataContext';
import { RootStackParamList } from '../../navigation/types';
import { Card } from '../../components/Card';
import { MoonIcon } from '../../components/MoonIcon';
import { buildJourneyEntries, computeCompanionMessage, getMoonPhase, lastSevenNights } from '../../data/selectors';
import { sortedRecords } from '../../data/nightRecords';
import { JourneyEntry } from './JourneyEntry';
import { MilestoneEntry } from './MilestoneEntry';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Journey'>;

export function JourneyScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { records } = useAppData();

  const checkedIn = sortedRecords(records).filter((r) => r.checkInCompletedAt != null);
  const lastRecord = checkedIn[checkedIn.length - 1];
  const bigPhase = getMoonPhase(lastRecord);
  const headline = lastRecord ? computeCompanionMessage(records, lastRecord.date) : 'Your journey starts here.';
  const pastNights = lastSevenNights(records);
  const entries = buildJourneyEntries(records);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bgBase }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => navigation.navigate('Home')} style={styles.backRow}>
          <Ionicons name="chevron-back" size={16} color={theme.colors.textMid} />
          <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 13 * theme.textScale, color: theme.colors.textMid }}>
            Home
          </Text>
        </Pressable>

        <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: theme.colors.textLow, marginBottom: 6 }}>
          Your journey
        </Text>
        <Text style={{ fontFamily: theme.fonts.displayItalic, fontSize: 24 * theme.textScale, color: theme.colors.textHi, marginBottom: 16 }}>
          The last few nights
        </Text>

        <Card>
          <View style={styles.headerRow}>
            <MoonIcon phase={bigPhase} size={64} maskColor={theme.colors.bgCard} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: theme.fonts.displayItalic, fontSize: 16 * theme.textScale, color: theme.colors.textHi }}>
                {headline}
              </Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 13 * theme.textScale, color: theme.colors.textMid, marginTop: 3 }}>
                {checkedIn.length} night{checkedIn.length === 1 ? '' : 's'} logged so far
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.moonRow}>
          {pastNights.map((n) => (
            <MoonIcon key={n.date} phase={n.phase} size={22} maskColor={theme.colors.bgBase} />
          ))}
        </View>

        <View style={styles.timeline}>
          <View style={[styles.timelineLine, { backgroundColor: theme.colors.hairline }]} />
          {entries.length === 0 && (
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 13.5 * theme.textScale, color: theme.colors.textLow }}>
              No nights logged yet. Once you check in, your journey will appear here.
            </Text>
          )}
          {entries.map((entry, i) =>
            entry.type === 'night' ? (
              <JourneyEntry key={`n-${entry.record.date}`} record={entry.record} />
            ) : (
              <MilestoneEntry key={`m-${entry.date}-${i}`} text={entry.text} />
            )
          )}
        </View>
      </ScrollView>

      <Pressable
        onPress={() => navigation.navigate('AddPastRecord', {})}
        style={[styles.fab, { backgroundColor: theme.colors.accent }]}
      >
        <Ionicons name="calendar-outline" size={22} color={theme.colors.accentContrastText} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 80 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  moonRow: { flexDirection: 'row', gap: 8, marginVertical: 18 },
  timeline: { paddingLeft: 8, position: 'relative' },
  timelineLine: { position: 'absolute', left: 12, top: 6, bottom: 6, width: 1 },
  fab: {
    position: 'absolute',
    bottom: 26,
    right: 22,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});
