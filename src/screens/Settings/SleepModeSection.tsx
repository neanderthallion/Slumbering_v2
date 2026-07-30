import React from 'react';
import { View, Text, Switch, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppData } from '../../data/AppDataContext';
import { useSleepModeEngine } from '../../hooks/useSleepModeEngine';
import { Card } from '../../components/Card';
import { formatTime12h } from '../../utils/date';

interface Props {
  onOpenSheet: () => void;
}

export function SleepModeSection({ onOpenSheet }: Props) {
  const { theme } = useTheme();
  const { settings } = useAppData();
  const { isActive, activate, deactivate } = useSleepModeEngine();
  const sm = settings.sleepMode;

  return (
    <Card onPress={onOpenSheet}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14 * theme.textScale, color: theme.colors.textHi }}>
            Sleep mode
          </Text>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5 * theme.textScale, color: theme.colors.textLow, marginTop: 2 }}>
            {sm.autoActivated
              ? `${formatTime12h(sm.bedtime)} – ${formatTime12h(sm.wakeTime)} · repeats nightly`
              : 'Manual activation only'}
          </Text>
        </View>
        <Switch
          value={isActive}
          onValueChange={(v) => (v ? activate() : deactivate())}
          trackColor={{ true: theme.colors.accent, false: theme.colors.hairline }}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
