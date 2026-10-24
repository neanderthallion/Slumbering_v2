import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { ONBOARDING_COPY } from './copy';

/** Splitting evening/morning teaches the timing of the loop -- the confusing part of a state-dependent Home screen. */
export function DailyActionsStep() {
  const { theme } = useTheme();
  const copy = ONBOARDING_COPY.dailyActions;

  return (
    <View style={styles.wrap}>
      <Text
        style={{
          fontFamily: theme.fonts.display,
          fontSize: 24 * theme.textScale,
          lineHeight: 30 * theme.textScale,
          color: theme.colors.textHi,
          textAlign: 'center',
          marginBottom: 24,
        }}
      >
        {copy.headline}
      </Text>

      {[copy.evening, copy.morning].map((block) => (
        <View key={block.label} style={[styles.block, { backgroundColor: theme.colors.bgCardStrong, borderColor: theme.colors.hairline }]}>
          <Text
            style={{
              fontFamily: theme.fonts.bodyBold,
              fontSize: 10.5 * theme.textScale,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              color: theme.colors.accent,
              marginBottom: 6,
            }}
          >
            {block.label}
          </Text>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 14 * theme.textScale, lineHeight: 20 * theme.textScale, color: theme.colors.textHi }}>
            {block.body}
          </Text>
        </View>
      ))}

      <Text
        style={{
          fontFamily: theme.fonts.displayItalic,
          fontSize: 13.5 * theme.textScale,
          color: theme.colors.textMid,
          textAlign: 'center',
          marginTop: 12,
        }}
      >
        {copy.reassurance}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 20, paddingBottom: 8 },
  block: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 12 },
});
