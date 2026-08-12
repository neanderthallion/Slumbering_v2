import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../../components/Card';
import { TextSizeKey, ThemeMode } from '../../types/domain';

const TEXT_SIZE_ORDER: TextSizeKey[] = ['small', 'medium', 'large'];
const TEXT_SIZE_LABELS: Record<TextSizeKey, string> = { small: 'Small', medium: 'Medium', large: 'Large' };
const THEME_LABELS: Record<ThemeMode, string> = { light: 'Light', dark: 'Dark' };

export function AppearanceSection() {
  const { theme, mode, textSize, setMode, setTextSize } = useTheme();

  return (
    <Card>
      <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14 * theme.textScale, color: theme.colors.textHi, marginBottom: 8 }}>Theme</Text>
      <View style={styles.row}>
        {(['light', 'dark'] as ThemeMode[]).map((m) => {
          const active = mode === m;
          const label = (
            <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 13, color: active ? theme.colors.ctaText : theme.colors.textMid }}>
              {THEME_LABELS[m]}
            </Text>
          );
          if (active) {
            return (
              <LinearGradient
                key={m}
                colors={[theme.colors.ctaGradientFrom, theme.colors.ctaGradientVia, theme.colors.ctaGradientTo]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0.4 }}
                style={styles.segment}
              >
                {label}
              </LinearGradient>
            );
          }
          return (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={[styles.segment, { backgroundColor: theme.colors.bgCardStrong, borderColor: theme.colors.borderSubtle, borderWidth: 1.5 }]}
            >
              {label}
            </Pressable>
          );
        })}
      </View>

      <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14 * theme.textScale, color: theme.colors.textHi, marginTop: 18, marginBottom: 8 }}>
        Text size
      </Text>
      <View style={styles.row}>
        {TEXT_SIZE_ORDER.map((key) => (
          <Pressable
            key={key}
            onPress={() => setTextSize(key)}
            style={[styles.segment, { backgroundColor: textSize === key ? theme.colors.accent : theme.colors.bgCardStrong, borderColor: theme.colors.hairline }]}
          >
            <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 12.5, color: textSize === key ? theme.colors.accentContrastText : theme.colors.textMid }}>
              {TEXT_SIZE_LABELS[key]}
            </Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 24 },
});
