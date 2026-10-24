import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { MoonMascot } from '../../components/MoonMascot';
import { SlumberingWordmark } from '../../components/SlumberingWordmark';
import { COPY, fmt } from '../../copy';

interface Props {
  greeting: string; // e.g. "Good morning"
  userName: string;
}

export function GreetingHeader({ greeting, userName }: Props) {
  const { theme } = useTheme();

  const name = userName.trim();
  const formattedGreeting = name
    ? fmt(COPY.home.greetingWithName, { greeting, name })
    : fmt(COPY.home.greetingWithoutName, { greeting });

  return (
    <View style={styles.wrap}>
      <View style={styles.textCol}>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: theme.fonts.bodyBold,
            fontSize: 11 * theme.textScale,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            color: theme.colors.textLow,
            marginBottom: 8,
          }}
        >
          {formattedGreeting}
        </Text>
        {/* 10% larger than the base 38px wordmark / 56px mascot used elsewhere. */}
        <SlumberingWordmark height={41.8 * theme.textScale} />
      </View>
      <MoonMascot size={61.6} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 22,
    marginTop: 4,
  },
  textCol: {
    flex: 1,
  },
});
