import React from 'react';
import { Text } from 'react-native';
import { Card } from '../../components/Card';
import { useTheme } from '../../theme/ThemeProvider';

interface Props {
  message: string;
  subMessage: string;
}

export function TodaysMessageCard({ message, subMessage }: Props) {
  const { theme } = useTheme();
  return (
    <Card variant="organic">
      <Text
        style={{
          fontFamily: theme.fonts.bodyBold,
          fontSize: 16 * theme.textScale,
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
