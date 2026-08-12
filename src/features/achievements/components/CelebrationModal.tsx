import React, { useEffect } from 'react';
import { BackHandler, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme/ThemeProvider';
import { Button } from '../../../components/Button';
import { MoonMascot } from '../../../components/MoonMascot';
import { BadgeIconImage } from './BadgeIconImage';
import { AchievementUnlock } from '../logic/celebrationGating';
import { BADGE_DEFINITIONS } from '../badges';

interface Props {
  unlocks: AchievementUnlock[];
  onClose: () => void;
}

export function CelebrationModal({ unlocks, onClose }: Props) {
  const { theme } = useTheme();

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [onClose]);

  if (unlocks.length === 0) return null;
  const hasBadge = unlocks.some((u) => u.category === 'badge');

  return (
    <View style={styles.scrim}>
      <View style={[theme.shadows.panel, styles.shadowWrap]}>
        {/* LinearGradient is purely a decorative background layer here (absoluteFill
            behind plain-View content) rather than the sized node itself -- a
            LinearGradient used directly as the sized/flex container doesn't reliably
            size to its own content (see Card.tsx's "night" variant for the same fix),
            which was collapsing this into an unbounded full-screen box. */}
        <View style={styles.card}>
          <LinearGradient
            colors={[theme.colors.bgCardAltFrom, theme.colors.bgCardAltTo]}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.handle, { backgroundColor: theme.colors.borderSubtle }]} />
          <MoonMascot size={64} />
          <Text style={{ fontFamily: theme.fonts.display, fontSize: 20 * theme.textScale, color: theme.colors.textHi, textAlign: 'center', marginTop: 10, marginBottom: 6 }}>
            {hasBadge ? 'Congratulations!' : unlocks.length === 1 ? 'New achievement!' : 'New achievements!'}
          </Text>
          {unlocks.map((u) =>
            u.category === 'badge' && u.badgeId ? (
              <View key={u.id} style={styles.badgeUnlock}>
                <BadgeIconImage badgeId={u.badgeId} earned size={50} />
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
          <Button label="Nice!" variant="primary" onPress={onClose} style={styles.closeBtn} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(33,28,62,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 10,
  },
  shadowWrap: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 40,
  },
  card: {
    width: '100%',
    borderRadius: 40,
    padding: 28,
    alignItems: 'center',
    overflow: 'hidden',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 999,
    marginBottom: 16,
  },
  unlockRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4, justifyContent: 'center' },
  badgeUnlock: { alignItems: 'center', marginBottom: 10 },
  closeBtn: { marginTop: 14, minWidth: 140 },
});
