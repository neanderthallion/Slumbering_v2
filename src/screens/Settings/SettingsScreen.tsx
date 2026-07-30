import React, { useRef } from 'react';
import { Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

import { useTheme } from '../../theme/ThemeContext';
import { RootStackParamList } from '../../navigation/types';
import { ProfileSection } from './ProfileSection';
import { RemindersSection } from './RemindersSection';
import { SleepModeSection } from './SleepModeSection';
import { SleepModeSheet } from './SleepModeSheet';
import { DefaultNightPlanSection } from './DefaultNightPlanSection';
import { AppearanceSection } from './AppearanceSection';
import { BackupRestoreSection } from './BackupRestoreSection';
import { AppInfoSection } from './AppInfoSection';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

function SectionTitle({ children }: { children: string }) {
  const { theme } = useTheme();
  return (
    <Text
      style={{
        fontFamily: theme.fonts.bodyBold,
        fontSize: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: theme.colors.accent,
        marginTop: 22,
        marginBottom: 8,
      }}
    >
      {children}
    </Text>
  );
}

export function SettingsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const sheetRef = useRef<BottomSheetModal>(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bgBase }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => navigation.navigate('Home')} style={styles.backRow}>
          <Ionicons name="chevron-back" size={16} color={theme.colors.textMid} />
          <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 13 * theme.textScale, color: theme.colors.textMid }}>
            Home
          </Text>
        </Pressable>

        <Text style={{ fontFamily: theme.fonts.displayItalic, fontSize: 24 * theme.textScale, color: theme.colors.textHi, marginBottom: 6 }}>
          Settings
        </Text>

        <SectionTitle>Profile</SectionTitle>
        <ProfileSection />

        <SectionTitle>Reminders</SectionTitle>
        <RemindersSection />

        <SectionTitle>Sleep mode</SectionTitle>
        <SleepModeSection onOpenSheet={() => sheetRef.current?.present()} />

        <SectionTitle>Default night plan</SectionTitle>
        <DefaultNightPlanSection />

        <SectionTitle>Appearance</SectionTitle>
        <AppearanceSection />

        <SectionTitle>Backup & restore</SectionTitle>
        <BackupRestoreSection />

        <SectionTitle>App information</SectionTitle>
        <AppInfoSection />
      </ScrollView>

      <SleepModeSheet ref={sheetRef} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
});
