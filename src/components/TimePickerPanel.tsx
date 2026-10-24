import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

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

/**
 * On Android, `@react-native-community/datetimepicker` always opens a native
 * system dialog and renders nothing inline -- so this component has no
 * visible UI of its own; it must not be wrapped in decorative chrome (a
 * bordered/padded box), which would otherwise render as a visible empty box
 * with nothing in it.
 */
export function TimePickerPanel({ time, onChange, onRequestClose }: Props) {
  return (
    <DateTimePicker
      value={timeToDate(time)}
      mode="time"
      is24Hour={false}
      display="spinner"
      onChange={(event, date) => {
        onRequestClose();
        if (event.type === 'set' && date) onChange(`${pad(date.getHours())}:${pad(date.getMinutes())}`);
      }}
    />
  );
}
