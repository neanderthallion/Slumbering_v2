import React, { useState } from 'react';
import { Pressable, ScrollView, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { Card } from '../../../components/Card';
import { NightRecordsMap, BadgeId } from '../../../types/domain';
import { BadgeIconImage } from './BadgeIconImage';
import { BadgeInfoModal } from './BadgeInfoModal';
import { computeBadgeUnlocks } from '../logic/badgeUnlocks';
import { BADGE_DEFINITIONS } from '../badges';

interface Props {
  records: NightRecordsMap;
}

/** Horizontal gallery of all 7 fixed badges, earned or not; tapping one opens its info modal. */
export function BadgesRow({ records }: Props) {
  const { theme } = useTheme();
  const [openBadge, setOpenBadge] = useState<BadgeId | null>(null);
  const earnedBadgeIds = new Set(computeBadgeUnlocks(records).map((b) => b.badgeId));

  return (
    <>
      <Card>
        <Text
          style={{
            fontFamily: theme.fonts.bodyBold,
            fontSize: 11 * theme.textScale,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: theme.colors.textLow,
            marginBottom: 4,
          }}
        >
          Huy hiệu
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesRow}>
          {(Object.keys(BADGE_DEFINITIONS) as BadgeId[]).map((id) => (
            <Pressable key={id} onPress={() => setOpenBadge(id)}>
              <BadgeIconImage badgeId={id} earned={earnedBadgeIds.has(id)} size={74} />
            </Pressable>
          ))}
        </ScrollView>
      </Card>

      {openBadge && <BadgeInfoModal badgeId={openBadge} earned={earnedBadgeIds.has(openBadge)} onClose={() => setOpenBadge(null)} />}
    </>
  );
}

const styles = StyleSheet.create({
  badgesRow: { flexDirection: 'row', gap: 18, paddingRight: 4 },
});
