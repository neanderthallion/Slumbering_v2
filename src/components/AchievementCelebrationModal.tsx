import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Button } from './Button';
import { BadgeIcon } from './BadgeIcon';
import { AchievementUnlock } from '../data/achievements';

interface Props {
  unlocks: AchievementUnlock[];
  onClose: () => void;
}

export function AchievementCelebrationModal({ unlocks, onClose }: Props) {
  const { theme } = useTheme();
  if (unlocks.length === 0) return null;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <View style={styles.scrim}>
        <View style={[styles.card, { backgroundColor: theme.colors.bgCardStrong, borderColor: theme.colors.hairline }]}>
          <BadgeIcon size={40} color={theme.colors.amber} />
          <Text
            style={{
              fontFamily: theme.fonts.displayItalic,
              fontSize: 19 * theme.textScale,
              color: theme.colors.textHi,
              textAlign: 'center',
              marginTop: 12,
              marginBottom: 6,
            }}
          >
            {unlocks.length === 1 ? 'New achievement!' : 'New achievements!'}
          </Text>
          {unlocks.map((u) => (
            <Text
              key={u.id}
              style={{
                fontFamily: theme.fonts.bodyMedium,
                fontSize: 14 * theme.textScale,
                color: u.category === 'badge' ? theme.colors.amber : theme.colors.sage,
                textAlign: 'center',
                marginBottom: 4,
              }}
            >
              {u.text}
            </Text>
          ))}
          <Button label="Nice!" variant="primary" onPress={onClose} style={styles.closeBtn} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 26,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  closeBtn: { marginTop: 14, flex: 0, paddingHorizontal: 28 },
});
