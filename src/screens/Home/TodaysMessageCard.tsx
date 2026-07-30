import React from 'react';
import { Text } from 'react-native';
import { Card } from '../../components/Card';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  message: string;
  subMessage: string;
}

export function TodaysMessageCard({ message, subMessage }: Props) {
  const { theme } = useTheme();
  return (
    <Card>
      <Text
        style={{
          fontFamily: theme.fonts.displayItalic,
          fontSize: 18 * theme.textScale,
          lineHeight: 26 * theme.textScale,
          color: theme.colors.textHi,
        }}
      >
        {message}
      </Text>
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontSize: 13 * theme.textScale,
          color: theme.colors.textMid,
          marginTop: 4,
        }}
      >
        {subMessage}
      </Text>
    </Card>
  );
}
