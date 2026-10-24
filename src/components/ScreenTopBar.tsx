import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { MoonMascot } from './MoonMascot';
import { useTheme } from '../theme/ThemeProvider';
import { RootStackParamList } from '../app/navigation.types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/** Mascot + Settings entry point shared by every bottom-tab screen (Home/Journey/Bedtime). */
export function ScreenTopBar() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.topBar}>
      <MoonMascot size={30} />
      <Pressable
        onPress={() => navigation.navigate('Settings')}
        style={[styles.iconBtn, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.hairline }, theme.shadows.pop]}
      >
        <Ionicons name="settings-outline" size={17} color={theme.colors.textHi} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 4,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
