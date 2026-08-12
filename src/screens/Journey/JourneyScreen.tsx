import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../theme/ThemeProvider';
import { useRecordsStore } from '../../store/recordsStore';
import { RootStackParamList } from '../../app/navigation.types';
import { ScreenContainer } from '../../components/ScreenContainer';
import { BackRow } from '../../components/BackRow';
import { Card } from '../../components/Card';
import { SuccessRing } from '../../features/journey/components/SuccessRing';
import { TimelineList } from '../../features/journey/components/TimelineList';
import { buildJourneyEntries, computeAllTimeStats } from '../../features/journey/logic/journeyEntries';
import { BadgeIconImage } from '../../features/achievements/components/BadgeIconImage';
import { BadgeInfoModal } from '../../features/achievements/components/BadgeInfoModal';
import { computeBadgeUnlocks } from '../../features/achievements/logic/badgeUnlocks';
import { BADGE_DEFINITIONS } from '../../features/achievements/badges';
import { BadgeId } from '../../types/domain';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Journey'>;

export function JourneyScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const records = useRecordsStore((s) => s.records);
  const [openBadge, setOpenBadge] = useState<BadgeId | null>(null);

  const entries = buildJourneyEntries(records);
  const stats = computeAllTimeStats(records);
  const earnedBadgeIds = new Set(computeBadgeUnlocks(records).map((b) => b.badgeId));

  return (
    <ScreenContainer
      contentStyle={{ paddingBottom: 80 }}
      overlay={
        <>
          {openBadge && <BadgeInfoModal badgeId={openBadge} earned={earnedBadgeIds.has(openBadge)} onClose={() => setOpenBadge(null)} />}
          <Pressable
            onPress={() => navigation.navigate('AddPastRecord', {})}
            style={[styles.fab, { backgroundColor: theme.colors.accent }, theme.shadows.raised]}
          >
            <Ionicons name="calendar-outline" size={22} color={theme.colors.accentContrastText} />
          </Pressable>
        </>
      }
    >
      <BackRow />

      <Text style={{ fontFamily: theme.fonts.display, fontSize: 24 * theme.textScale, color: theme.colors.textHi, marginBottom: 18 }}>
        Journey
      </Text>

      <Card variant="night">
        <View style={styles.statsRow}>
          <SuccessRing
            successRate={stats.successRate}
            size={104}
            trackColor="rgba(251,243,228,0.14)"
            progressColor={theme.colors.nightAccent}
            textColor={theme.colors.nightText}
            labelColor={theme.colors.nightTextDim}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 17 * theme.textScale, color: theme.colors.nightText }}>
              {stats.nightsLogged} night(s) logged
            </Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 13 * theme.textScale, color: theme.colors.nightTextDim, marginTop: 4 }}>
              {stats.successfulNights} fully successful, all-time
            </Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 13 * theme.textScale, color: theme.colors.nightTextDim, marginTop: 2 }}>
              {stats.longestStreak}-night longest streak
            </Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 11 * theme.textScale, letterSpacing: 1.2, textTransform: 'uppercase', color: theme.colors.textLow, marginBottom: 4 }}>
          Badges
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesRow}>
          {(Object.keys(BADGE_DEFINITIONS) as BadgeId[]).map((id) => (
            <Pressable key={id} onPress={() => setOpenBadge(id)}>
              <BadgeIconImage badgeId={id} earned={earnedBadgeIds.has(id)} size={74} />
            </Pressable>
          ))}
        </ScrollView>
      </Card>

      <TimelineList entries={entries} onPressNight={(date) => navigation.navigate('AddPastRecord', { date })} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  badgesRow: { flexDirection: 'row', gap: 18, paddingRight: 4 },
  fab: {
    position: 'absolute',
    bottom: 26,
    right: 22,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
