import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { Button } from '../../../components/Button';
import { ModalScrim } from '../../../components/ModalScrim';
import { BadgeIconImage } from './BadgeIconImage';
import { BadgeId } from '../../../types/domain';
import { BADGE_DEFINITIONS } from '../badges';
import { COPY } from '../../../copy';

interface Props {
  badgeId: BadgeId;
  earned: boolean;
  onClose: () => void;
}

export function BadgeInfoModal({ badgeId, earned, onClose }: Props) {
  const { theme } = useTheme();
  const badge = BADGE_DEFINITIONS[badgeId];

  return (
    <ModalScrim onClose={onClose}>
      <BadgeIconImage badgeId={badgeId} earned={earned} size={150} />
      <Text style={{ fontFamily: theme.fonts.display, fontSize: 18 * theme.textScale, color: theme.colors.textHi, textAlign: 'center', marginTop: 12, marginBottom: 6 }}>
        {badge.name}
      </Text>
      <Text style={{ fontFamily: theme.fonts.body, fontSize: 13.5 * theme.textScale, color: theme.colors.textMid, textAlign: 'center' }}>
        {badge.description}
      </Text>
      <Button label={COPY.common.gotIt} variant="primary" onPress={onClose} style={styles.closeBtn} />
    </ModalScrim>
  );
}

const styles = StyleSheet.create({
  closeBtn: { marginTop: 14, minWidth: 140 },
});
