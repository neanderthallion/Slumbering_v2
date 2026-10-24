import React from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { COPY } from '../../../copy';

interface Props {
  message: string;
  onBack: () => void;
  onContinue: () => void;
}

/**
 * Built from the app's own Card/Button components (plain card theme) rather
 * than the native Alert, so it looks like the rest of the app instead of an
 * OS system dialog. RN's Modal renders as a top-level overlay regardless of
 * where it's mounted, so this works fine nested deep inside a ScrollView
 * (e.g. from BedtimeSchedulePanel on Home) without needing a portal.
 */
export function ScheduleWarningModal({ message, onBack, onContinue }: Props) {
  const { theme } = useTheme();

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onBack}>
      <View style={styles.scrim}>
        <View style={styles.cardWrap}>
          <Card>
            <Text
              style={{
                fontFamily: theme.fonts.body,
                fontSize: 14 * theme.textScale,
                color: theme.colors.textHi,
                lineHeight: 20 * theme.textScale,
                marginBottom: 18,
              }}
            >
              {message}
            </Text>
            <View style={styles.btnRow}>
              <Button label={COPY.scheduleWarningModal.back} variant="ghost" onPress={onBack} />
              <Button label={COPY.scheduleWarningModal.continueAnyway} variant="primary" onPress={onContinue} />
            </View>
          </Card>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(33,28,62,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  cardWrap: { width: '100%', maxWidth: 340 },
  btnRow: { flexDirection: 'row', gap: 10 },
});
