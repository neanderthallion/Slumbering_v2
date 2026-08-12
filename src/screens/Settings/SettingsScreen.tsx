import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { ScreenContainer } from '../../components/ScreenContainer';
import { BackRow } from '../../components/BackRow';
import { ProfileSection } from './ProfileSection';
import { RemindersSection } from './RemindersSection';
import { AppearanceSection } from './AppearanceSection';
import { BackupRestoreSection } from './BackupRestoreSection';
import { AppInfoSection } from './AppInfoSection';

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

  return (
    <ScreenContainer>
      <BackRow />

      <Text style={{ fontFamily: theme.fonts.displayItalic, fontSize: 24 * theme.textScale, color: theme.colors.textHi, marginBottom: 6 }}>Settings</Text>

      <SectionTitle>Profile</SectionTitle>
      <ProfileSection />

      <SectionTitle>Reminders</SectionTitle>
      <RemindersSection />

      <SectionTitle>Appearance</SectionTitle>
      <AppearanceSection />

      <SectionTitle>Backup & restore</SectionTitle>
      <BackupRestoreSection />

      <SectionTitle>App information</SectionTitle>
      <AppInfoSection />
    </ScreenContainer>
  );
}
