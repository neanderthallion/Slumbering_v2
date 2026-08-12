import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useSettingsStore } from '../../store/settingsStore';
import { Card } from '../../components/Card';
import { TimeField } from '../../components/TimeField';
import { BedtimeCrescentIcon } from '../../components/BedtimeCrescentIcon';
import { WakeupSunIcon } from '../../components/WakeupSunIcon';
import { CloudSheep } from '../../components/CloudSheep';
import { minutesBetween } from '../../lib/dateMath';
import { getScheduleWarningMessage } from '../../features/bedtime/logic/scheduleWarnings';
import { ScheduleWarningModal } from '../../features/bedtime/components/ScheduleWarningModal';

interface Props {
  onPress: () => void;
}

interface PendingWarning {
  message: string;
  onContinue: () => void;
}

export function BedtimeSchedulePanel({ onPress }: Props) {
  const { theme } = useTheme();
  const bedtime = useSettingsStore((s) => s.bedtime);
  const wakeTime = useSettingsStore((s) => s.wakeTime);
  const setBedtime = useSettingsStore((s) => s.setBedtime);
  const setWakeTime = useSettingsStore((s) => s.setWakeTime);
  const [pendingWarning, setPendingWarning] = useState<PendingWarning | null>(null);

  const duration = minutesBetween(bedtime, wakeTime);

  function handleBedtimeChange(newBedtime: string) {
    const message = getScheduleWarningMessage(newBedtime, wakeTime);
    if (!message) {
      setBedtime(newBedtime);
      return;
    }
    setPendingWarning({ message, onContinue: () => setBedtime(newBedtime) });
  }

  function handleWakeTimeChange(newWakeTime: string) {
    const message = getScheduleWarningMessage(bedtime, newWakeTime);
    if (!message) {
      setWakeTime(newWakeTime);
      return;
    }
    setPendingWarning({ message, onContinue: () => setWakeTime(newWakeTime) });
  }

  return (
    <>
      <Card variant="night" onPress={onPress}>
        <View style={styles.headerRow}>
          <Text
            style={{
              fontFamily: theme.fonts.bodyBold,
              fontSize: 11 * theme.textScale,
              letterSpacing: 1.4,
              textTransform: 'uppercase',
              color: theme.colors.nightAccent,
              opacity: 0.85,
            }}
          >
            Bedtime schedule
          </Text>
          <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 12.5 * theme.textScale, color: theme.colors.nightAccent }}>See all →</Text>
        </View>
        <View style={styles.windowRow}>
          <View style={styles.col}>
            <BedtimeCrescentIcon size={36} />
            <View style={{ marginTop: 8 }}>
              <TimeField
                label="Bedtime"
                time={bedtime}
                onChange={handleBedtimeChange}
                labelColor={theme.colors.nightTextDim}
                valueColor={theme.colors.nightText}
                iconColor={theme.colors.nightTextDim}
              />
            </View>
          </View>
          <View style={styles.divider}>
            <CloudSheep width={56} height={40} />
          </View>
          <View style={styles.col}>
            <WakeupSunIcon size={36} />
            <View style={{ marginTop: 8 }}>
              <TimeField
                label="Wake-up"
                time={wakeTime}
                onChange={handleWakeTimeChange}
                labelColor={theme.colors.nightTextDim}
                valueColor={theme.colors.nightText}
                iconColor={theme.colors.nightTextDim}
              />
            </View>
          </View>
        </View>
        <View style={styles.durationRow}>
          <View style={[styles.durationPill, { backgroundColor: 'rgba(251,243,228,0.1)', borderColor: 'rgba(251,243,228,0.25)' }]}>
            <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 12 * theme.textScale, color: theme.colors.nightText }}>
              {`Sleep duration · ${Math.floor(duration / 60)}h ${duration % 60}m`}
            </Text>
          </View>
        </View>
      </Card>

      {pendingWarning && (
        <ScheduleWarningModal
          message={pendingWarning.message}
          onBack={() => setPendingWarning(null)}
          onContinue={() => {
            pendingWarning.onContinue();
            setPendingWarning(null);
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  windowRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  col: { flex: 1, alignItems: 'center' },
  divider: { width: 56, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  durationRow: { alignItems: 'center', marginTop: 18 },
  durationPill: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1 },
});
