import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Button } from './Button';

interface Props {
  message: string;
  onContinue: () => void;
  onChangeGoal: () => void;
}

export function DisclaimerDialog({ message, onContinue, onChangeGoal }: Props) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.box,
        { backgroundColor: 'rgba(240,178,94,0.12)', borderColor: 'rgba(240,178,94,0.4)' },
      ]}
    >
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
        <Button label="Change Goal" variant="ghost" onPress={onChangeGoal} />
        <Button label="Continue" variant="primary" onPress={onContinue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
    marginBottom: 14,
  },
  row: { flexDirection: 'row', gap: 10 },
});
