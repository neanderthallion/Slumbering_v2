import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { Button } from '../../../components/Button';
import { ModalScrim } from '../../../components/ModalScrim';
import { MoonMascot } from '../../../components/MoonMascot';
import { BadgeIconImage } from './BadgeIconImage';
import { AchievementUnlock } from '../logic/celebrationGating';
import { BADGE_DEFINITIONS } from '../badges';
import { COPY } from '../../../copy';

interface Props {
  unlocks: AchievementUnlock[];
  onClose: () => void;
}

export function CelebrationModal({ unlocks, onClose }: Props) {
  const { theme } = useTheme();

  if (unlocks.length === 0) return null;
  const hasBadge = unlocks.some((u) => u.category === 'badge');
  const title = hasBadge
    ? COPY.achievements.celebration.congratulations
    : unlocks.length === 1
      ? COPY.achievements.celebration.newAchievementOne
      : COPY.achievements.celebration.newAchievementMany;

  return (
    <ModalScrim onClose={onClose}>
      <MoonMascot size={44} />
      <Text style={{ fontFamily: theme.fonts.display, fontSize: 20 * theme.textScale, color: theme.colors.textHi, textAlign: 'center', marginTop: 10, marginBottom: 6 }}>
        {title}
      </Text>
      {unlocks.map((u) =>
        u.category === 'badge' && u.badgeId ? (
          <View key={u.id} style={styles.badgeUnlock}>
            <BadgeIconImage badgeId={u.badgeId} earned size={70} />
            <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 15 * theme.textScale, color: theme.colors.amber, textAlign: 'center', marginTop: 6 }}>
              {u.text}
            </Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5 * theme.textScale, color: theme.colors.textMid, textAlign: 'center' }}>
              {BADGE_DEFINITIONS[u.badgeId].description}
            </Text>
          </View>
        ) : (
          <View key={u.id} style={styles.unlockRow}>
            <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14 * theme.textScale, color: theme.colors.sage, textAlign: 'center' }}>
              {u.text}
            </Text>
          </View>
        )
      )}
      <Button label={COPY.common.nice} variant="primary" onPress={onClose} style={styles.closeBtn} />
    </ModalScrim>
  );
}

const styles = StyleSheet.create({
  unlockRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4, justifyContent: 'center' },
  badgeUnlock: { alignItems: 'center', marginBottom: 10 },
  closeBtn: { marginTop: 14, minWidth: 140 },
});
