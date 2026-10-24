import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../../theme/ThemeProvider';
import { COPY } from '../../../copy';
import { useSoundPlayer } from '../SoundPlayerProvider';

/**
 * Now-playing panel pinned directly above the bottom tab bar (Sound screen
 * only). Shows once a track has been chosen and stays until another is chosen.
 */
export function MiniPlayer() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { currentTrack, isPlaying, toggle } = useSoundPlayer();

  if (!currentTrack) return null;

  // Tab bar real height: minHeight 56 + its own bottom safe-area padding.
  const bottom = 56 + insets.bottom;

  return (
    <View
      style={[
        styles.wrap,
        theme.shadows.panel,
        { bottom, backgroundColor: theme.colors.nightGradientFrom, borderTopColor: theme.colors.hairline },
      ]}
    >
      <Image source={currentTrack.image} style={styles.thumb} resizeMode="cover" />
      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          fontFamily: theme.fonts.bodyBold,
          fontSize: 14 * theme.textScale,
          color: theme.colors.nightText,
        }}
      >
        {COPY.sound.trackNames[currentTrack.id]}
      </Text>
      <Pressable
        onPress={toggle}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? COPY.sound.pause : COPY.sound.play}
        style={[styles.btn, { backgroundColor: theme.colors.nightAccent }]}
      >
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color={theme.colors.nightGradientTo} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  thumb: { width: 44, height: 44, borderRadius: 12 },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
