import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface Props {
  value: boolean[]; // length 7, Mon..Sun
  onChange: (value: boolean[]) => void;
}

export function WeekdayPicker({ value, onChange }: Props) {
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      {LABELS.map((label, i) => {
        const active = value[i];
        return (
          <Pressable
            key={i}
            onPress={() => {
              const next = [...value];
              next[i] = !next[i];
              onChange(next);
            }}
            style={[
              styles.dow,
              {
                backgroundColor: active ? theme.colors.accent : theme.colors.bgCard,
                borderColor: active ? 'transparent' : theme.colors.hairline,
              },
            ]}
          >
            <Text
              style={{
                fontFamily: theme.fonts.bodyBold,
                fontSize: 12,
                color: active ? theme.colors.accentContrastText : theme.colors.textMid,
              }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, marginTop: 8 },
  dow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
