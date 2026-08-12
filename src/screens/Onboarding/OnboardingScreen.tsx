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

const THEME_LABELS: Record<ThemeMode, string> = { light: 'Light', dark: 'Dark' };

export function OnboardingScreen() {
  const { theme, mode, setMode } = useTheme();
  const setDisplayName = useSettingsStore((s) => s.setDisplayName);
  const setHasOnboarded = useSettingsStore((s) => s.setHasOnboarded);
  const [name, setName] = useState('');

  function handleGetStarted() {
    setDisplayName(cleanDisplayName(name));
    setHasOnboarded(true);
  }

  return (
    <LinearGradient colors={[theme.colors.bgGradientTop, theme.colors.bgGradientBottom]} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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
                Welcome
              </Text>
              <Text style={{ fontFamily: theme.fonts.display, fontSize: 26 * theme.textScale, lineHeight: 33 * theme.textScale, color: theme.colors.textHi }}>
                {"Let's set up Slumbering"}
              </Text>
            </View>
            <MoonMascot size={52} />
          </View>

          <Card>
            <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14 * theme.textScale, color: theme.colors.textHi, marginBottom: 8 }}>
              What should we call you?
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={theme.colors.textLow}
              style={[styles.input, { backgroundColor: theme.colors.bgCardStrong, borderColor: theme.colors.hairline, color: theme.colors.textHi }]}
            />
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 12 * theme.textScale, color: theme.colors.textLow, marginTop: 6 }}>
              Used to personalize your greetings, optional. You can add or change this later in Settings.
            </Text>
          </Card>

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
          </Card>

          <Button label="Get started" variant="primary" onPress={handleGetStarted} style={{ marginTop: 8 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: 20, paddingTop: 24, paddingBottom: 40 },
  introRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 },
  input: { borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15 },
  row: { flexDirection: 'row', gap: 8 },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 24 },
});
