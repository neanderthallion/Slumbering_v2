import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../theme/ThemeContext';
import { useAppData } from '../../data/AppDataContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ACCENT_ORDER, ACCENTS } from '../../theme/accents';
import { AccentKey, ThemeMode } from '../../types/models';

export function OnboardingScreen() {
  const { theme, mode, accent, setMode, setAccent } = useTheme();
  const { updateSettings } = useAppData();
  const [name, setName] = useState('');

  function handleGetStarted() {
    updateSettings((prev) => ({ ...prev, userName: name.trim(), hasOnboarded: true }));
  }

  return (
    <LinearGradient colors={[theme.colors.bgGradientTop, theme.colors.bgGradientBottom]} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text
            style={{
              fontFamily: theme.fonts.bodyBold,
              fontSize: 11 * theme.textScale,
              letterSpacing: 1.4,
              textTransform: 'uppercase',
              color: theme.colors.textLow,
              marginBottom: 6,
            }}
          >
            Welcome
          </Text>
          <Text
            style={{
              fontFamily: theme.fonts.displayItalic,
              fontSize: 28 * theme.textScale,
              color: theme.colors.textHi,
              marginBottom: 20,
            }}
          >
            Let's set up Slumbering
          </Text>

          <Card>
            <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14 * theme.textScale, color: theme.colors.textHi, marginBottom: 8 }}>
              What should we call you?
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={theme.colors.textLow}
              style={[
                styles.input,
                { backgroundColor: theme.colors.bgCardStrong, borderColor: theme.colors.hairline, color: theme.colors.textHi },
              ]}
            />
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 12 * theme.textScale, color: theme.colors.textLow, marginTop: 6 }}>
              Used to personalize your greetings. Optional -- you can add or change this later in Settings.
            </Text>
          </Card>

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
              Accent color
            </Text>
            <View style={styles.swatchRow}>
              {ACCENT_ORDER.map((key: AccentKey) => (
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
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  row: { flexDirection: 'row', gap: 8 },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 12, borderWidth: 1 },
  swatchRow: { flexDirection: 'row', gap: 12 },
  swatch: { width: 30, height: 30, borderRadius: 15, borderWidth: 2 },
});
