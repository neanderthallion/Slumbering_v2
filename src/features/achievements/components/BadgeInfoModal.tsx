import React, { useEffect } from 'react';
import { BackHandler, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme/ThemeProvider';
import { Button } from '../../../components/Button';
import { BadgeIconImage } from './BadgeIconImage';
import { BadgeId } from '../../../types/domain';
import { BADGE_DEFINITIONS } from '../badges';

interface Props {
  badgeId: BadgeId;
  earned: boolean;
  onClose: () => void;
}

export function BadgeInfoModal({ badgeId, earned, onClose }: Props) {
  const { theme } = useTheme();
  const badge = BADGE_DEFINITIONS[badgeId];

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [onClose]);

  return (
    <View style={styles.scrim}>
      <View style={[theme.shadows.panel, styles.shadowWrap]}>
        <View style={styles.card}>
          <LinearGradient
            colors={[theme.colors.bgCardAltFrom, theme.colors.bgCardAltTo]}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.handle, { backgroundColor: theme.colors.borderSubtle }]} />
          <BadgeIconImage badgeId={badgeId} earned={earned} size={150} />
          <Text style={{ fontFamily: theme.fonts.display, fontSize: 18 * theme.textScale, color: theme.colors.textHi, textAlign: 'center', marginTop: 12, marginBottom: 6 }}>
            {badge.name}
          </Text>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 13.5 * theme.textScale, color: theme.colors.textMid, textAlign: 'center' }}>
            {badge.description}
          </Text>
          <Button label="Got it" variant="primary" onPress={onClose} style={styles.closeBtn} />
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
  closeBtn: { marginTop: 14, minWidth: 140 },
});
