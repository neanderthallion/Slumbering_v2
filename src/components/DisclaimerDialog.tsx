import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from './Button';
import { COPY } from '../copy';

interface Props {
  message: string;
  onContinue: () => void;
  onChangeGoal: () => void;
}

export function DisclaimerDialog({ message, onContinue, onChangeGoal }: Props) {
  const { theme } = useTheme();
  return (
    <View style={[styles.box, { backgroundColor: 'rgba(252,226,166,0.14)', borderColor: 'rgba(252,226,166,0.4)' }]}>
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontSize: 13 * theme.textScale,
          color: theme.colors.amber,
          lineHeight: 19 * theme.textScale,
          marginBottom: 10,
        }}
      >
        {message}
      </Text>
      <View style={styles.row}>
        <Button label={COPY.disclaimer.changeGoal} variant="ghost" onPress={onChangeGoal} />
        <Button label={COPY.disclaimer.continue} variant="primary" onPress={onContinue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1.5,
    borderRadius: 24,
    padding: 16,
    marginTop: 4,
    marginBottom: 14,
  },
  row: { flexDirection: 'row', gap: 10 },
});
