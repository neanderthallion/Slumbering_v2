import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';

interface Props {
  value: boolean | null;
  onChange: (value: boolean) => void;
}

export function Pill({ value, onChange }: Props) {
  const { theme } = useTheme();

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onChange(false)}
        style={[styles.pill, { backgroundColor: theme.colors.bgCardStrong, borderColor: theme.colors.borderSubtle }, value === false && styles.pillSolidNo]}
      >
        <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 12 * theme.textScale, color: value === false ? '#fbf3e4' : theme.colors.textMid }}>
          No
        </Text>
      </Pressable>

      {value === true ? (
        <LinearGradient
          colors={[theme.colors.ctaGradientFrom, theme.colors.ctaGradientVia, theme.colors.ctaGradientTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.4 }}
          style={styles.pill}
        >
          <Pressable onPress={() => onChange(true)} style={styles.pillFill}>
            <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 12 * theme.textScale, color: theme.colors.ctaText }}>Yes</Text>
          </Pressable>
        </LinearGradient>
      ) : (
        <Pressable onPress={() => onChange(true)} style={[styles.pill, { backgroundColor: theme.colors.bgCardStrong, borderColor: theme.colors.borderSubtle }]}>
          <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 12 * theme.textScale, color: theme.colors.textMid }}>Yes</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  pill: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  pillFill: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillSolidNo: {
    backgroundColor: '#383163',
    borderColor: 'transparent',
  },
});
