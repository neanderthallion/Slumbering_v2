import React from 'react';
import { Text } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { ScreenContainer } from '../../components/ScreenContainer';
import { ScreenTopBar } from '../../components/ScreenTopBar';
import { BottomTabBar } from '../../components/BottomTabBar';
import { COPY } from '../../copy';
import { SOUND_SETS } from '../../features/sound/catalog';
import { SoundSetRow } from '../../features/sound/components/SoundSetRow';
import { MiniPlayer } from '../../features/sound/components/MiniPlayer';

export function SoundScreen() {
  const { theme } = useTheme();

  return (
    <ScreenContainer
      contentStyle={{ paddingBottom: 180 }}
      overlay={
        <>
          <MiniPlayer />
          <BottomTabBar active="Sound" />
        </>
      }
    >
      <ScreenTopBar />
      <Text
        style={{
          fontFamily: theme.fonts.display,
          fontSize: 24 * theme.textScale,
          color: theme.colors.textHi,
          marginBottom: 18,
        }}
      >
        {COPY.sound.screenTitle}
      </Text>

      {SOUND_SETS.map((set) => (
        <SoundSetRow key={set.id} set={set} />
      ))}
    </ScreenContainer>
  );
}
