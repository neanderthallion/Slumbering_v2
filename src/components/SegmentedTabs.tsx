import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';

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
        const label = (
          <Text
            style={{
              fontFamily: theme.fonts.bodyBold,
              fontSize: 13 * theme.textScale,
              color: active ? theme.colors.ctaText : theme.colors.textMid,
            }}
          >
            {tab.label}
          </Text>
        );

        if (active) {
          return (
            <LinearGradient
              key={tab.key}
              colors={[theme.colors.ctaGradientFrom, theme.colors.ctaGradientVia, theme.colors.ctaGradientTo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0.4 }}
              style={styles.tab}
            >
              <Pressable onPress={() => onChange(tab.key)} style={styles.tabFill}>
                {label}
              </Pressable>
            </LinearGradient>
          );
        }

        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.tab, { backgroundColor: theme.colors.bgCardStrong, borderColor: theme.colors.borderSubtle, borderWidth: 1.5 }]}
          >
            {label}
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
    borderRadius: 999,
  },
  tabFill: {
    width: '100%',
    alignItems: 'center',
  },
});
