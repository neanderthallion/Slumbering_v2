import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { formatTime12h, parseTypedTime } from '../utils/date';
import { TimePickerPanel } from './TimePickerPanel';

interface Props {
  label: string;
  time: string; // 'HH:mm'
  onChange: (time: string) => void;
  emoji?: string;
}

export function TimeField({ label, time, onChange, emoji }: Props) {
  const { theme } = useTheme();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingText, setEditingText] = useState(false);
  const [draft, setDraft] = useState('');

  function startEditingText() {
    setDraft(formatTime12h(time));
    setEditingText(true);
  }

  function commitDraft() {
    setEditingText(false);
    const parsed = parseTypedTime(draft, time);
    if (parsed) onChange(parsed);
  }

  const valueTextStyle = { fontFamily: theme.fonts.bodyMedium, fontSize: 19, color: theme.colors.accent };

  return (
    <View style={styles.box}>
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
      <View style={styles.valueRow}>
        {editingText ? (
          <TextInput
            value={draft}
            onChangeText={(t) => setDraft(t.replace(/[^0-9apmAPM]/g, ''))}
            onSubmitEditing={commitDraft}
            onBlur={commitDraft}
            autoFocus
            selectTextOnFocus
            style={[valueTextStyle, styles.textInput, { borderColor: theme.colors.accent }]}
          />
        ) : (
          <Pressable onPress={startEditingText}>
            <Text style={valueTextStyle}>{formatTime12h(time)}</Text>
          </Pressable>
        )}
        <Pressable onPress={() => setPickerOpen(true)} hitSlop={8}>
          <Ionicons name="time-outline" size={17} color={theme.colors.textLow} />
        </Pressable>
      </View>
      {pickerOpen && (
        <TimePickerPanel time={time} onChange={onChange} onRequestClose={() => setPickerOpen(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1 },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  textInput: { borderWidth: 1, borderRadius: 6, paddingVertical: 0, paddingHorizontal: 4, minWidth: 78 },
});
