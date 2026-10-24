import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MoonMascot } from '../../components/MoonMascot';
import { useTheme } from '../../theme/ThemeProvider';
import { ONBOARDING_COPY } from './copy';

/** The loop diagram is the single most important element here -- it's the direct fix for "didn't know what to do first." */
export function OrientStep() {
  const { theme } = useTheme();
  const copy = ONBOARDING_COPY.orient;

  return (
    <View style={styles.wrap}>
      <MoonMascot size={64} />
      <Text
        style={{
          fontFamily: theme.fonts.display,
          fontSize: 24 * theme.textScale,
          lineHeight: 30 * theme.textScale,
          color: theme.colors.textHi,
          textAlign: 'center',
          marginTop: 18,
          marginBottom: 10,
        }}
      >
        {copy.headline}
      </Text>
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontSize: 14.5 * theme.textScale,
          lineHeight: 21 * theme.textScale,
          color: theme.colors.textMid,
          textAlign: 'center',
          marginBottom: 26,
        }}
      >
        {copy.body}
      </Text>

      <View style={styles.loopRow}>
        {copy.loop.map((step, i) => (
          <React.Fragment key={step.label}>
            {i > 0 && <Ionicons name="chevron-forward" size={16} color={theme.colors.textLow} style={styles.chevron} />}
            <View style={styles.loopChip}>
              <View style={[styles.loopIconWrap, { backgroundColor: theme.colors.accentSoft }]}>
                <Ionicons name={step.icon} size={20} color={theme.colors.accent} />
              </View>
              <Text
                style={{ fontFamily: theme.fonts.bodyBold, fontSize: 11.5 * theme.textScale, color: theme.colors.textHi, marginTop: 6, textAlign: 'center' }}
              >
                {step.label}
              </Text>
            </View>
          </React.Fragment>
        ))}
      </View>

      <View style={[styles.repeatsPill, { backgroundColor: theme.colors.bgCardStrong, borderColor: theme.colors.hairline }]}>
        <Ionicons name="refresh-outline" size={13} color={theme.colors.textLow} />
        <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 11.5 * theme.textScale, color: theme.colors.textLow, marginLeft: 6 }}>
          {copy.repeats}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: 8, paddingTop: 20, paddingBottom: 8 },
  loopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', marginBottom: 22 },
  loopChip: { width: 78, alignItems: 'center' },
  loopIconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  chevron: { marginTop: 16, marginHorizontal: 2 },
  repeatsPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1 },
});
