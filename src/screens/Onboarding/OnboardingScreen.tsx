import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MoonMascot } from '../../components/MoonMascot';

import { useTheme } from '../../theme/ThemeProvider';
import { useSettingsStore } from '../../store/settingsStore';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ThemeMode } from '../../types/domain';
import { cleanDisplayName } from '../../features/settings/logic/profile';
import { OrientStep } from './OrientStep';
import { DailyActionsStep } from './DailyActionsStep';
import { FeatureMapStep } from './FeatureMapStep';
import { ONBOARDING_COPY } from './copy';
import { COPY } from '../../copy';

const THEME_LABELS: Record<ThemeMode, string> = {
  light: COPY.onboarding.setup.light,
  dark: COPY.onboarding.setup.dark,
};
// 3 doc-specified loop-teaching steps (orient, daily actions, feature map) + the existing
// name/theme step, which the doc doesn't call for but has no other home in the app.
const LOOP_STEPS = 3;
const TOTAL_STEPS = LOOP_STEPS + 1;

export function OnboardingScreen() {
  const { theme, mode, setMode } = useTheme();
  const setDisplayName = useSettingsStore((s) => s.setDisplayName);
  const setHasOnboarded = useSettingsStore((s) => s.setHasOnboarded);
  const [name, setName] = useState('');
  const [step, setStep] = useState(0);
  const isLoopStep = step < LOOP_STEPS;
  const canSkip = step < LOOP_STEPS - 1;

  function handleGetStarted() {
    setDisplayName(cleanDisplayName(name));
    setHasOnboarded(true);
  }

  function handleNext() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  return (
    <LinearGradient colors={[theme.colors.bgGradientTop, theme.colors.bgGradientBottom]} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {canSkip && (
            <Pressable style={styles.skipBtn} onPress={() => setHasOnboarded(true)}>
              <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 12.5 * theme.textScale, color: theme.colors.textLow }}>
                {ONBOARDING_COPY.skip}
              </Text>
            </Pressable>
          )}

          {step === 0 && <OrientStep />}
          {step === 1 && <DailyActionsStep />}
          {step === 2 && <FeatureMapStep />}
          {step === 3 && (
            <>
              <View style={styles.introRow}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: theme.fonts.bodyBold,
                      fontSize: 11 * theme.textScale,
                      letterSpacing: 1.4,
                      textTransform: 'uppercase',
                      color: theme.colors.textLow,
                      marginBottom: 8,
                    }}
                  >
                    {COPY.onboarding.setup.eyebrow}
                  </Text>
                  <Text style={{ fontFamily: theme.fonts.display, fontSize: 26 * theme.textScale, lineHeight: 33 * theme.textScale, color: theme.colors.textHi }}>
                    {COPY.onboarding.setup.headline}
                  </Text>
                </View>
                <MoonMascot size={52} />
              </View>

              <Card>
                <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14 * theme.textScale, color: theme.colors.textHi, marginBottom: 8 }}>
                  {COPY.onboarding.setup.whatToCallYou}
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder={COPY.onboarding.setup.namePlaceholder}
                  placeholderTextColor={theme.colors.textLow}
                  style={[styles.input, { backgroundColor: theme.colors.bgCardStrong, borderColor: theme.colors.hairline, color: theme.colors.textHi }]}
                />
                <Text style={{ fontFamily: theme.fonts.body, fontSize: 12 * theme.textScale, color: theme.colors.textLow, marginTop: 6 }}>
                  {COPY.onboarding.setup.nameHint}
                </Text>
              </Card>

              <Card>
                <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14 * theme.textScale, color: theme.colors.textHi, marginBottom: 8 }}>{COPY.onboarding.setup.theme}</Text>
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
              </Card>
            </>
          )}

          <View style={styles.dotsRow}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View key={i} style={[styles.dot, { backgroundColor: i === step ? theme.colors.accent : theme.colors.borderSubtle }]} />
            ))}
          </View>

          <View style={styles.navRow}>
            {step > 0 && <Button label={ONBOARDING_COPY.back} variant="ghost" onPress={handleBack} style={{ flex: 1 }} />}
            {isLoopStep ? (
              <Button label={ONBOARDING_COPY.next} variant="primary" onPress={handleNext} style={{ flex: 1 }} />
            ) : (
              <Button label={ONBOARDING_COPY.getStarted} variant="primary" onPress={handleGetStarted} style={{ flex: 1 }} />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: 20, paddingTop: 24, paddingBottom: 40 },
  skipBtn: { alignSelf: 'flex-end', paddingVertical: 6, paddingHorizontal: 4, marginBottom: 4 },
  introRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 },
  input: { borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15 },
  row: { flexDirection: 'row', gap: 8 },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 24 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 24, marginBottom: 8 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  navRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
});
