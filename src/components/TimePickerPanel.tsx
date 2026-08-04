import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../theme/ThemeContext';
import { parseTimeToMinutes } from '../utils/date';

interface Props {
  time: string; // 'HH:mm'
  onChange: (time: string) => void;
  onRequestClose: () => void;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function timeToDate(time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

const ROWS_SHOWN = 7;

/**
 * @react-native-community/datetimepicker has no web implementation (it silently
 * no-ops on web), so this renders a custom wheel-style picker there instead of
 * the native one, guaranteeing the same look on every platform.
 */
export function TimePickerPanel({ time, onChange, onRequestClose }: Props) {
  const { theme } = useTheme();

  if (Platform.OS !== 'web') {
    return (
      <DateTimePicker
        value={timeToDate(time)}
        mode="time"
        is24Hour={false}
        display={Platform.OS === 'android' ? 'spinner' : undefined}
        onChange={(event, date) => {
          if (Platform.OS !== 'ios') onRequestClose();
          if (event.type === 'set' && date) onChange(`${pad(date.getHours())}:${pad(date.getMinutes())}`);
        }}
      />
    );
  }

  const totalMinutes = parseTimeToMinutes(time);
  const hour24 = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const isPM = hour24 >= 12;
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  function commit(nextHour12: number, nextMinute: number, nextIsPM: boolean) {
    let h24 = nextHour12 % 12;
    if (nextIsPM) h24 += 12;
    onChange(`${pad(h24)}:${pad(nextMinute)}`);
  }

  const hourValues = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12
  const minuteValues = Array.from({ length: 60 }, (_, i) => i); // 0..59
  const meridiemValues: Array<'PM' | 'AM'> = isPM ? ['PM', 'AM'] : ['AM', 'PM'];

  return (
    <View style={[styles.panel, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.hairline }]}>
      <View style={styles.row}>
        <WheelColumn values={hourValues} selectedIndex={hour12 - 1} format={pad} onSelect={(v) => commit(v, minute, isPM)} />
        <WheelColumn values={minuteValues} selectedIndex={minute} format={pad} onSelect={(v) => commit(hour12, v, isPM)} />
        <WheelColumn
          values={meridiemValues}
          selectedIndex={0}
          format={(v) => v}
          onSelect={(v) => commit(hour12, minute, v === 'PM')}
        />
      </View>
      <Pressable onPress={onRequestClose} style={styles.doneBtn} hitSlop={8}>
        <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 13, color: theme.colors.accent }}>Done</Text>
      </Pressable>
    </View>
  );
}

function WheelColumn<T extends string | number>({
  values,
  selectedIndex,
  format,
  onSelect,
}: {
  values: T[];
  selectedIndex: number;
  format: (v: T) => string;
  onSelect: (v: T) => void;
}) {
  const { theme } = useTheme();
  const rowCount = Math.min(values.length, ROWS_SHOWN);
  const rows = Array.from({ length: rowCount }, (_, i) => values[(selectedIndex + i) % values.length]);

  return (
    <View style={styles.wheelColumn}>
      {rows.map((v, i) => (
        <Pressable
          key={`${v}-${i}`}
          onPress={() => onSelect(v)}
          style={[styles.wheelRow, i === 0 && { backgroundColor: theme.colors.accent }]}
        >
          <Text
            style={{
              fontFamily: i === 0 ? theme.fonts.bodyBold : theme.fonts.body,
              fontSize: i === 0 ? 17 : 14,
              color: i === 0 ? theme.colors.accentContrastText : theme.colors.textMid,
            }}
          >
            {format(v)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { borderWidth: 1, borderRadius: 14, padding: 12, marginTop: 8 },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  wheelColumn: { alignItems: 'center', width: 56 },
  wheelRow: { paddingVertical: 6, borderRadius: 8, width: '100%', alignItems: 'center', marginVertical: 1 },
  doneBtn: { alignSelf: 'center', marginTop: 10, paddingVertical: 6, paddingHorizontal: 14 },
});
