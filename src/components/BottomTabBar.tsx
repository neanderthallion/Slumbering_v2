import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme/ThemeProvider';
import { RootStackParamList } from '../app/navigation.types';
import { HomeTabIcon, JourneyTabIcon, BedtimeTabIcon, SoundTabIcon } from './TabIcons';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type TabKey = 'Home' | 'Journey' | 'Bedtime' | 'Sound';

const TABS: { key: TabKey; label: string; Icon: typeof HomeTabIcon }[] = [
  { key: 'Home', label: 'Trang chủ', Icon: HomeTabIcon },
  { key: 'Journey', label: 'Hành trình', Icon: JourneyTabIcon },
  { key: 'Bedtime', label: 'Lịch ngủ', Icon: BedtimeTabIcon },
  { key: 'Sound', label: 'Audio', Icon: SoundTabIcon },
];

interface Props {
  active: TabKey;
}

/** Persistent bottom navigation across the three primary screens -- built on the existing single stack (navigate() between siblings) rather than a tab-navigator dependency. */
export function BottomTabBar({ active }: Props) {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { backgroundColor: theme.colors.bgCard, borderTopColor: theme.colors.hairline, paddingBottom: insets.bottom }]}>
      {TABS.map(({ key, label, Icon }) => {
        const isActive = key === active;
        // In light theme, `accent` (dusk-800) is the same value as `textHi`, so it reads as
        // near-black and doesn't stand out from ordinary text -- use the warmer, more
        // saturated `blush` brand accent for the active tab there instead. Dark theme's gold
        // accent already contrasts clearly against the muted inactive color, so it's unchanged.
        const activeColor = theme.mode === 'light' ? theme.colors.blush : theme.colors.accent;
        const color = isActive ? activeColor : theme.colors.textLow;
        return (
          <Pressable
            key={key}
            onPress={() => {
              if (!isActive) navigation.navigate(key);
            }}
            style={styles.tab}
          >
            <Icon size={22} color={color} />
            <Text numberOfLines={1} style={{ fontFamily: theme.fonts.bodyBold, fontSize: 11 * theme.textScale, color, marginTop: 4 }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  tab: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
});
