import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { formatClockTime } from '../lib/dateMath';
import { TimePickerPanel } from './TimePickerPanel';

interface Props {
  label: string;
  time: string; // 'HH:mm'
  onChange: (time: string) => void;
  emoji?: string;
  labelColor?: string;
  valueColor?: string;
  iconColor?: string;
}

/** Tapping either the time value or the clock icon opens the native TimePickerPanel -- there is no manual/typed time entry. */
export function TimeField({ label, time, onChange, emoji, labelColor, valueColor, iconColor }: Props) {
  const { theme } = useTheme();
  const [pickerOpen, setPickerOpen] = useState(false);

  const resolvedValueColor = valueColor ?? theme.colors.accent;
  const resolvedLabelColor = labelColor ?? theme.colors.textLow;
  const resolvedIconColor = iconColor ?? theme.colors.textLow;
  const valueTextStyle = { fontFamily: theme.fonts.bodyMedium, fontSize: 19, color: resolvedValueColor };

  return (
    <View style={styles.box}>
      <Text
        style={{
          fontFamily: theme.fonts.bodyBold,
          fontSize: 10.5,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          color: resolvedLabelColor,
          marginBottom: 6,
        }}
      >
        {emoji ? `${emoji} ` : ''}
        {label}
      </Text>
      <View style={styles.valueRow}>
        <Pressable onPress={() => setPickerOpen(true)}>
          <Text style={valueTextStyle}>{formatClockTime(time)}</Text>
        </Pressable>
        <Pressable onPress={() => setPickerOpen(true)} hitSlop={8}>
          <Ionicons name="time-outline" size={17} color={resolvedIconColor} />
        </Pressable>
      </View>
      {pickerOpen && <TimePickerPanel time={time} onChange={onChange} onRequestClose={() => setPickerOpen(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {},
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
