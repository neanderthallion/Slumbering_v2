import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../../theme/ThemeProvider';
import { COPY } from '../../../copy';
import { SoundTrack } from '../catalog';
import { useSoundPlayer } from '../SoundPlayerProvider';

const CARD_WIDTH = 150;

interface Props {
  track: SoundTrack;
}

export function SoundCard({ track }: Props) {
  const { theme } = useTheme();
  const { currentId, isPlaying, playTrack, downloadedIds, downloadingId } = useSoundPlayer();

  const isCurrent = currentId === track.id;
  const showPause = isCurrent && isPlaying;
  const isDownloading = downloadingId === track.id;
  const isDownloaded = downloadedIds.has(track.id);

  const name = COPY.sound.trackNames[track.id];
  const label = isDownloading
    ? `${name}, ${COPY.sound.downloading}`
    : isDownloaded
      ? `${name}, ${COPY.sound.downloaded}`
      : name;

  return (
    <Pressable
      onPress={() => playTrack(track.id)}
      style={styles.wrap}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View
        style={[
          styles.frame,
          {
            borderRadius: theme.radii.md,
            borderColor: isCurrent ? theme.colors.accent : theme.colors.borderSubtle,
            borderWidth: isCurrent ? 2 : 1,
          },
        ]}
      >
        <Image source={track.image} style={styles.image} resizeMode="cover" />
        <View style={[styles.badge, { backgroundColor: theme.colors.accent }]}>
          {isDownloading ? (
            <ActivityIndicator size="small" color={theme.colors.accentContrastText} />
          ) : (
            <Ionicons
              name={showPause ? 'pause' : 'play'}
              size={14}
              color={theme.colors.accentContrastText}
            />
          )}
        </View>
      </View>

      {/* Cached-on-device marker: a small sage dot with a soft halo. Rendered as
          a sibling of the cover frame so the halo isn't clipped by its
          `overflow: 'hidden'`. */}
      {isDownloaded && !isDownloading && (
        <>
          <View style={[styles.dotHalo, { backgroundColor: theme.colors.sage }]} />
          <View style={[styles.dot, { backgroundColor: theme.colors.sage }]} />
        </>
      )}

      <Text
        numberOfLines={2}
        style={{
          fontFamily: theme.fonts.bodyMedium,
          fontSize: 13 * theme.textScale,
          color: theme.colors.textHi,
          marginTop: 8,
        }}
      >
        {name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: CARD_WIDTH },
  frame: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotHalo: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    opacity: 0.3,
  },
  dot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
