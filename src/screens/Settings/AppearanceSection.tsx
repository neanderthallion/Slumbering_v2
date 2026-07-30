import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card } from '../../components/Card';
import { ACCENT_ORDER, ACCENTS } from '../../theme/accents';
import { AccentKey, TextSizeKey, ThemeMode } from '../../types/models';

const TEXT_SIZES: { key: TextSizeKey; label: string }[] = [
  { key: 'small', label: 'Small' },
  { key: 'medium', label: 'Medium' },
  { key: 'large', label: 'Large' },
];

export function AppearanceSection() {
  const { theme, mode, accent, textSize, setMode, setAccent, setTextSize } = useTheme();

  return (
    <Card>
      <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14 * theme.textScale, color: theme.colors.textHi, marginBottom: 8 }}>
        Theme
      </Text>
      <View style={styles.row}>
        {(['light', 'dark'] as ThemeMode[]).map((m) => (
          <Pressable
            key={m}
            onPress={() => setMode(m)}
            style={[
              styles.segment,
              { backgroundColor: mode === m ? theme.colors.accent : theme.colors.bgCardStrong, borderColor: theme.colors.hairline },
            ]}
          >
            <Text
              style={{
                fontFamily: theme.fonts.bodyBold,
                fontSize: 13,
                color: mode === m ? theme.colors.accentContrastText : theme.colors.textMid,
                textTransform: 'capitalize',
              }}
            >
              {m}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14 * theme.textScale, color: theme.colors.textHi, marginTop: 18, marginBottom: 8 }}>
        Accent
      </Text>
      <View style={styles.swatchRow}>
        {ACCENT_ORDER.map((key) => (
          <Pressable
            key={key}
            onPress={() => setAccent(key)}
            style={[
              styles.swatch,
              { backgroundColor: ACCENTS[key].hex, borderColor: accent === key ? theme.colors.textHi : 'transparent' },
            ]}
          />
        ))}
      </View>

      <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14 * theme.textScale, color: theme.colors.textHi, marginTop: 18, marginBottom: 8 }}>
        Text size
      </Text>
      <View style={styles.row}>
        {TEXT_SIZES.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setTextSize(t.key)}
            style={[
              styles.segment,
              { backgroundColor: textSize === t.key ? theme.colors.accent : theme.colors.bgCardStrong, borderColor: theme.colors.hairline },
            ]}
          >
            <Text
              style={{
                fontFamily: theme.fonts.bodyBold,
                fontSize: 12.5,
                color: textSize === t.key ? theme.colors.accentContrastText : theme.colors.textMid,
              }}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 12, borderWidth: 1 },
  swatchRow: { flexDirection: 'row', gap: 12 },
  swatch: { width: 30, height: 30, borderRadius: 15, borderWidth: 2 },
});
