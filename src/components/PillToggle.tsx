import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  value: boolean | null;
  onChange: (value: boolean) => void;
}

export function PillToggle({ value, onChange }: Props) {
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onChange(true)}
        style={[
          styles.pill,
          { borderColor: theme.colors.hairline },
          value === true && { backgroundColor: theme.colors.sage, borderColor: 'transparent' },
        ]}
      >
        <Text
          style={{
            fontFamily: theme.fonts.bodyBold,
            fontSize: 12 * theme.textScale,
            color: value === true ? '#0e2b20' : theme.colors.textMid,
          }}
        >
          Yes
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange(false)}
        style={[
          styles.pill,
          { borderColor: theme.colors.hairline },
          value === false && { backgroundColor: theme.colors.bgCardStrong, borderColor: 'transparent' },
        ]}
      >
        <Text
          style={{
            fontFamily: theme.fonts.bodyBold,
            fontSize: 12 * theme.textScale,
            color: theme.colors.textHi,
          }}
        >
          No
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  pill: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 20,
    borderWidth: 1,
  },
});
