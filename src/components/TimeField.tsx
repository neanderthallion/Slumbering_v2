import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../theme/ThemeContext';
import { formatTime12h } from '../utils/date';

interface Props {
  label: string;
  time: string; // 'HH:mm'
  onChange: (time: string) => void;
  emoji?: string;
}

function timeToDate(time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function dateToTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function TimeField({ label, time, onChange, emoji }: Props) {
  const { theme } = useTheme();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <View style={[styles.box, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.hairline }]}>
      <Text
        style={{
          fontFamily: theme.fonts.bodyBold,
          fontSize: 10.5,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          color: theme.colors.textLow,
          marginBottom: 6,
        }}
      >
        {emoji ? `${emoji} ` : ''}
        {label}
      </Text>
      <Pressable onPress={() => setPickerOpen(true)}>
        <Text style={{ fontFamily: theme.fonts.display, fontSize: 20, color: theme.colors.textHi }}>
          {formatTime12h(time)}
        </Text>
      </Pressable>
      {pickerOpen && (
        <DateTimePicker
          value={timeToDate(time)}
          mode="time"
          is24Hour={false}
          onChange={(event, date) => {
            setPickerOpen(Platform.OS === 'ios');
            if (event.type === 'set' && date) onChange(dateToTime(date));
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, borderRadius: 16, padding: 14, borderWidth: 1 },
});
