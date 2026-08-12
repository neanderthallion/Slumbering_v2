import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeProvider';
import { Checkbox } from '../../../components/Checkbox';

interface Props {
  label: string;
  checked: boolean;
  disabled?: boolean;
  isEditing: boolean;
  editValue: string;
  onToggle: () => void;
  onStartEdit: () => void;
  onChangeEditValue: (text: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  isLast?: boolean;
}

export function EditableGoalListItem({
  label,
  checked,
  disabled,
  isEditing,
  editValue,
  onToggle,
  onStartEdit,
  onChangeEditValue,
  onSaveEdit,
  onCancelEdit,
  isLast,
}: Props) {
  const { theme } = useTheme();

  return (
    <View style={[styles.row, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.colors.hairline }]}>
      <Checkbox checked={checked} onPress={isEditing ? undefined : onToggle} disabled={disabled} />

      {isEditing ? (
        <TextInput
          value={editValue}
          onChangeText={onChangeEditValue}
          autoFocus
          onSubmitEditing={onSaveEdit}
          style={[styles.input, { color: theme.colors.textHi, borderColor: theme.colors.accent, fontFamily: theme.fonts.body }]}
        />
      ) : (
        <Pressable onPress={disabled ? undefined : onToggle} style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: theme.fonts.body,
              fontSize: 14.5 * theme.textScale,
              color: disabled ? theme.colors.textLow : theme.colors.textHi,
              lineHeight: 20 * theme.textScale,
            }}
          >
            {label}
          </Text>
        </Pressable>
      )}

      {isEditing ? (
        <View style={styles.editActions}>
          <Pressable onPress={onSaveEdit} hitSlop={8}>
            <Ionicons name="checkmark" size={18} color={theme.colors.accent} />
          </Pressable>
          <Pressable onPress={onCancelEdit} hitSlop={8}>
            <Ionicons name="close" size={18} color={theme.colors.textLow} />
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={onStartEdit} hitSlop={8} style={{ opacity: disabled ? 0.35 : 1 }} disabled={disabled}>
          <Ionicons name="create-outline" size={18} color={theme.colors.textMid} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    borderBottomWidth: 1,
    paddingVertical: 2,
  },
  editActions: { flexDirection: 'row', gap: 10, marginLeft: 4 },
});
