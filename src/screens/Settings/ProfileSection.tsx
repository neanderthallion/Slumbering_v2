import React, { useState } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useSettingsStore } from '../../store/settingsStore';
import { Card } from '../../components/Card';
import { cleanDisplayName } from '../../features/settings/logic/profile';

export function ProfileSection() {
  const { theme } = useTheme();
  const displayName = useSettingsStore((s) => s.profile.displayName);
  const setDisplayName = useSettingsStore((s) => s.setDisplayName);
  const [draft, setDraft] = useState(displayName);

  function commit() {
    const trimmed = cleanDisplayName(draft);
    if (trimmed !== displayName) setDisplayName(trimmed);
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
        style={[styles.input, { backgroundColor: theme.colors.bgCardStrong, borderColor: theme.colors.hairline, color: theme.colors.textHi }]}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  input: { borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 13, fontSize: 14.5 },
});
