import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../theme/ThemeContext';
import { useAppData } from '../../data/AppDataContext';
import { useToast } from '../../components/ToastProvider';
import { RootStackParamList } from '../../navigation/types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { createNightRecord } from '../../data/nightRecords';
import { todayKey } from '../../utils/date';

type Nav = NativeStackNavigationProp<RootStackParamList, 'TonightConfirmation'>;
type Rt = { key: string; name: string; params: RootStackParamList['TonightConfirmation'] };

export function TonightConfirmationScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { settings, upsertRecord } = useAppData();
  const { showToast } = useToast();
  const goals = route.params.goals;

  function handleConfirm() {
    const record = createNightRecord(todayKey(), goals, 'normal', settings.bedtimeSchedule);
    upsertRecord(record);
    navigation.navigate('Home');
    showToast('Goals saved for tonight');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bgBase }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => navigation.navigate('Home')} style={styles.backRow}>
          <Ionicons name="chevron-back" size={16} color={theme.colors.textMid} />
          <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 13 * theme.textScale, color: theme.colors.textMid }}>
            Home
          </Text>
        </Pressable>

        <Text style={{ fontFamily: theme.fonts.displayItalic, fontSize: 24 * theme.textScale, color: theme.colors.textHi, marginBottom: 16 }}>
          Tonight's goals are
        </Text>

        <Card>
          {goals.map((g, i) => (
            <View
              key={g.goalId}
              style={[styles.goalRow, i < goals.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.hairline }]}
            >
              <View style={[styles.checkDot, { backgroundColor: theme.colors.accent }]}>
                <Ionicons name="checkmark" size={12} color={theme.colors.accentContrastText} />
              </View>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 14.5 * theme.textScale, color: theme.colors.textHi, flex: 1 }}>
                {g.label}
              </Text>
            </View>
          ))}
        </Card>

        <View style={styles.btnRow}>
          <Button label="Edit goals" variant="ghost" onPress={() => navigation.goBack()} />
          <Button label="Confirm" variant="primary" onPress={handleConfirm} />
        </View>

        <Card style={{ marginTop: 18 }}>
          <Text style={{ fontFamily: theme.fonts.displayItalic, fontSize: 15 * theme.textScale, color: theme.colors.textHi }}>
            Rest well tonight. We'll check in tomorrow.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  checkDot: { width: 20, height: 20, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
});
