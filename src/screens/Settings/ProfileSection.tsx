import React, { useState } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppData } from '../../data/AppDataContext';
import { Card } from '../../components/Card';

export function ProfileSection() {
  const { theme } = useTheme();
  const { settings, updateSettings } = useAppData();
  const [draft, setDraft] = useState(settings.userName);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed !== settings.userName) {
      updateSettings((prev) => ({ ...prev, userName: trimmed }));
    }
  }

  return (
    <Card>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        onEndEditing={commit}
        onBlur={commit}
        placeholder="Your name"
        placeholderTextColor={theme.colors.textLow}
        style={[
          styles.input,
          { backgroundColor: theme.colors.bgCardStrong, borderColor: theme.colors.hairline, color: theme.colors.textHi },
        ]}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14.5 },
});
