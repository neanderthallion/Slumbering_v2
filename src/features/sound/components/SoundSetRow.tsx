import React from 'react';
import { Text, ScrollView, StyleSheet } from 'react-native';

import { useTheme } from '../../../theme/ThemeProvider';
import { COPY } from '../../../copy';
import { SoundSet, SOUND_TRACKS } from '../catalog';
import { SoundCard } from './SoundCard';

interface Props {
  set: SoundSet;
}

export function SoundSetRow({ set }: Props) {
  const { theme } = useTheme();

  return (
    <>
      <Text
        style={{
          fontFamily: theme.fonts.bodyBold,
          fontSize: 11 * theme.textScale,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: theme.colors.textLow,
          marginBottom: 12,
        }}
      >
        {COPY.sound.setTitles[set.id]}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.row}
        contentContainerStyle={styles.rowContent}
      >
        {set.trackIds.map((id) => (
          <SoundCard key={id} track={SOUND_TRACKS[id]} />
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  // Bleed the row to the screen edges (ScreenContainer pads content by 20).
  row: { marginHorizontal: -20, marginBottom: 28 },
  rowContent: { gap: 14, paddingHorizontal: 20 },
});
