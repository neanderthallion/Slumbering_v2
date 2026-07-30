import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  greeting: string; // one of GREETING_POOLS' base values: 'Welcome' | 'Welcome back' | 'Good morning' | ...
  userName: string;
}

function formatGreeting(base: string, userName: string): string {
  const name = userName.trim();
  if (base === 'Welcome') return name ? `Welcome, ${name}!` : 'Welcome!';
  if (base === 'Welcome back') return name ? `Welcome back, ${name}.` : 'Welcome back.';
  return name ? `${base}, ${name}` : `${base}.`;
}

export function GreetingHeader({ greeting, userName }: Props) {
  const { theme } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text
        style={{
          fontFamily: theme.fonts.bodyBold,
          fontSize: 11 * theme.textScale,
          letterSpacing: 1.4,
          textTransform: 'uppercase',
          color: theme.colors.textLow,
          marginBottom: 6,
        }}
      >
        {formatGreeting(greeting, userName)}
      </Text>
      <Text
        style={{
          fontFamily: theme.fonts.displayItalic,
          fontSize: 28 * theme.textScale,
          color: theme.colors.textHi,
        }}
      >
        Slumbering
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 18, marginTop: 4 },
});
