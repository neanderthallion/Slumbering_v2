import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppData } from '../../data/AppDataContext';
import { Card } from '../../components/Card';

export function DefaultNightPlanSection() {
  const { theme } = useTheme();
  const { settings, updateSettings } = useAppData();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(settings.defaultNightPlan);

  function startEdit() {
    setDraft(settings.defaultNightPlan);
    setEditing(true);
  }

  function save() {
    const cleaned = draft.map((d) => d.trim()).filter(Boolean);
    updateSettings((prev) => ({ ...prev, defaultNightPlan: cleaned }));
    setEditing(false);
  }

  if (editing) {
    return (
      <Card>
        {draft.map((line, i) => (
          <TextInput
            key={i}
            value={line}
            onChangeText={(text) => setDraft((prev) => prev.map((p, idx) => (idx === i ? text : p)))}
            style={[styles.input, { backgroundColor: theme.colors.bgCardStrong, borderColor: theme.colors.hairline, color: theme.colors.textHi }]}
          />
        ))}
        <View style={styles.row}>
          <Pressable onPress={() => setEditing(false)}>
            <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 13, color: theme.colors.textMid }}>Cancel</Text>
          </Pressable>
          <Pressable onPress={save}>
            <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 13, color: theme.colors.accent }}>Save</Text>
          </Pressable>
        </View>
      </Card>
    );
  }

  return (
    <Card>
      {settings.defaultNightPlan.map((line, i) => (
        <Text
          key={i}
          style={{
            fontFamily: theme.fonts.body,
            fontSize: 14 * theme.textScale,
            color: theme.colors.textHi,
            marginBottom: i === settings.defaultNightPlan.length - 1 ? 0 : 4,
          }}
        >
          {line}
        </Text>
      ))}
      <Pressable onPress={startEdit} style={{ marginTop: 10 }}>
        <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 12.5 * theme.textScale, color: theme.colors.textMid, fontStyle: 'italic' }}>
          Edit
        </Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  input: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13.5, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 4 },
});
