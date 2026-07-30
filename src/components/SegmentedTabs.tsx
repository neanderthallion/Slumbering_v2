import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface Tab {
  key: string;
  label: string;
}

interface Props {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function SegmentedTabs({ tabs, activeKey, onChange }: Props) {
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[
              styles.tab,
              {
                backgroundColor: active ? theme.colors.accent : theme.colors.bgCard,
                borderColor: active ? 'transparent' : theme.colors.hairline,
              },
            ]}
          >
            <Text
              style={{
                fontFamily: theme.fonts.bodyBold,
                fontSize: 13 * theme.textScale,
                color: active ? theme.colors.accentContrastText : theme.colors.textMid,
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
});
