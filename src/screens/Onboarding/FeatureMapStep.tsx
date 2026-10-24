import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { useSettingsStore } from '../../store/settingsStore';
import { useToast } from '../../components/ToastProvider';
import { Button } from '../../components/Button';
import { ensureNotificationPermission } from '../../features/notifications/logic/permissions';
import { ONBOARDING_COPY } from './copy';

/** Features are introduced as "where your progress shows up," and the reminders ask lands here -- after the value's been shown, which is when permission prompts convert best. */
export function FeatureMapStep() {
  const { theme } = useTheme();
  const copy = ONBOARDING_COPY.featureMap;
  const setReminder = useSettingsStore((s) => s.setReminder);
  const setWindDownReminder = useSettingsStore((s) => s.setWindDownReminder);
  const { showToast } = useToast();
  const [remindersOn, setRemindersOn] = useState(false);

  function handleTurnOnReminders() {
    ensureNotificationPermission().then((granted) => {
      if (granted) {
        setReminder('setGoals', { enabled: true });
        setReminder('checkIn', { enabled: true });
        setWindDownReminder({ enabled: true });
        setRemindersOn(true);
      } else {
        showToast(copy.permissionDenied);
      }
    });
  }

  return (
    <View style={styles.wrap}>
      <Text
        style={{
          fontFamily: theme.fonts.display,
          fontSize: 24 * theme.textScale,
          lineHeight: 30 * theme.textScale,
          color: theme.colors.textHi,
          textAlign: 'center',
          marginBottom: 22,
        }}
      >
        {copy.headline}
      </Text>

      {copy.features.map((f) => (
        <View key={f.name} style={styles.featureRow}>
          <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 14 * theme.textScale, color: theme.colors.textHi }}>{f.name}</Text>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 13 * theme.textScale, color: theme.colors.textMid, flex: 1, marginLeft: 8 }}>
            {f.body}
          </Text>
        </View>
      ))}
      <View style={styles.featureRow}>
        <Ionicons name="settings-outline" size={15} color={theme.colors.textHi} style={{ marginTop: 1 }} />
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 13 * theme.textScale, color: theme.colors.textMid, flex: 1, marginLeft: 8 }}>
          {copy.settingsLine}
        </Text>
      </View>

      <View style={[styles.remindersCard, { backgroundColor: theme.colors.bgCardStrong, borderColor: theme.colors.hairline }]}>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 13.5 * theme.textScale, lineHeight: 19 * theme.textScale, color: theme.colors.textHi, marginBottom: 12 }}>
          {copy.remindersCallout}
        </Text>
        <Button
          label={remindersOn ? ONBOARDING_COPY.remindersOn : ONBOARDING_COPY.turnOnReminders}
          variant={remindersOn ? 'ghost' : 'primary'}
          disabled={remindersOn}
          onPress={handleTurnOnReminders}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 20, paddingBottom: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  remindersCard: { borderRadius: 18, borderWidth: 1, padding: 16, marginTop: 8 },
});
