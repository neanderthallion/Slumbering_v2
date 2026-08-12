import { NightGoal } from '../types/domain';

export type RootStackParamList = {
  Home: undefined;
  GoalPicker: { mode: 'create' | 'edit'; date?: string } | undefined;
  TonightConfirmation: { goals: NightGoal[]; date?: string };
  CheckIn: undefined;
  Journey: undefined;
  AddPastRecord: { date?: string } | undefined;
  Settings: undefined;
  SleepScience: undefined;
  Bedtime: undefined;
};
