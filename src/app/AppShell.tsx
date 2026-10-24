import React, { useEffect, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { useSettingsStore } from '../store/settingsStore';
import { useRecordsStore } from '../store/recordsStore';
import { migrateLegacyStorage } from '../store/migrateLegacyStorage';
import { hasNotificationPermission } from '../features/notifications/logic/permissions';
import { syncReminderSchedules } from '../features/notifications/logic/sync';
import { useTheme } from '../theme/ThemeProvider';
import { RootNavigator } from './RootNavigator';
import { navigationRef } from './navigationRef';
import { OnboardingScreen } from '../screens/Onboarding/OnboardingScreen';

export function AppShell() {
  const { theme } = useTheme();
  const hasOnboarded = useSettingsStore((s) => s.hasOnboarded);
  const settingsHydrated = useSettingsStore((s) => s.hasHydrated);
  const recordsHydrated = useRecordsStore((s) => s.hasHydrated);
  const reminders = useSettingsStore((s) => s.reminders);
  const bedtime = useSettingsStore((s) => s.bedtime);
  const [migrationDone, setMigrationDone] = useState(false);

  useEffect(() => {
    if (!settingsHydrated || !recordsHydrated) return;
    migrateLegacyStorage().finally(() => setMigrationDone(true));
  }, [settingsHydrated, recordsHydrated]);

  useEffect(() => {
    // Also gated on migrationDone: a returning user's real reminders/bedtime only land via
    // migrateLegacyStorage's restoreSettings, which settingsHydrated alone doesn't wait for --
    // syncing before that completes would schedule notifications against stale defaults.
    if (!settingsHydrated || !migrationDone) return;
    // Only actually (re)schedules when permission is already granted --
    // requesting it happens from the Settings toggle itself (a user gesture),
    // not from this background sync.
    hasNotificationPermission().then((granted) => {
      if (granted) syncReminderSchedules({ reminders, bedtime });
    });
  }, [settingsHydrated, migrationDone, reminders, bedtime]);

  // The Android system back button otherwise pops one screen at a time,
  // retracing the full navigation history -- BackRow already jumps straight
  // to Home from any screen, so mirror that here: navigate('Home') collapses
  // the stack to the existing Home instance instead of pushing a duplicate.
  // On Home itself, fall through to the default behavior (exits the app).
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!navigationRef.isReady()) return false;
      const currentRoute = navigationRef.getCurrentRoute()?.name;
      if (currentRoute == null || currentRoute === 'Home') return false;
      navigationRef.navigate('Home');
      return true;
    });
    return () => sub.remove();
  }, []);

  const isLoaded = settingsHydrated && recordsHydrated && migrationDone;

  if (!isLoaded) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.bgBase }} />;
  }

  if (!hasOnboarded) {
    return (
      <>
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        <OnboardingScreen />
      </>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </NavigationContainer>
  );
}
