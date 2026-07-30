import React, { useCallback, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Fraunces_500Medium, Fraunces_500Medium_Italic } from '@expo-google-fonts/fraunces';
import { Manrope_400Regular, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';

import { View } from 'react-native';
import { AppDataProvider, useAppData } from './src/data/AppDataContext';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { ToastProvider } from './src/components/ToastProvider';
import { RootNavigator } from './src/navigation/RootNavigator';
import { OnboardingScreen } from './src/screens/Onboarding/OnboardingScreen';
import { registerNotificationHandler } from './src/notifications/handlers';

SplashScreen.preventAutoHideAsync().catch(() => {});
registerNotificationHandler();

function AppShell() {
  const { theme } = useTheme();
  const { settings, isLoaded } = useAppData();

  if (!isLoaded) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.bgBase }} />;
  }

  if (!settings.hasOnboarded) {
    return (
      <>
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        <OnboardingScreen />
      </>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Fraunces_500Medium,
    Fraunces_500Medium_Italic,
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <AppDataProvider>
          <ThemeProvider>
            <ToastProvider>
              <BottomSheetModalProvider>
                <AppShell />
              </BottomSheetModalProvider>
            </ToastProvider>
          </ThemeProvider>
        </AppDataProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
