import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Checkbox } from './Checkbox';

interface Props {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onPress?: () => void;
  isLast?: boolean;
}

export function GoalListItem({ label, checked, disabled, onPress, isLast }: Props) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={[
        styles.row,
        !isLast && { borderBottomWidth: 1, borderBottomColor: theme.colors.hairline },
      ]}
    >
      <Checkbox checked={checked} onPress={disabled ? undefined : onPress} disabled={disabled} />
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontSize: 14.5 * theme.textScale,
          color: disabled ? theme.colors.textLow : theme.colors.textHi,
          flex: 1,
          lineHeight: 20 * theme.textScale,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
  },
});
