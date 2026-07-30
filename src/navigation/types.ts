import { NightGoal } from '../types/models';

export type RootStackParamList = {
  Home: undefined;
  GoalPicker: { mode: 'create' | 'edit' } | undefined;
  TonightConfirmation: { goals: NightGoal[] };
  CheckIn: undefined;
  Journey: undefined;
  AddPastRecord: { date?: string } | undefined;
  Settings: undefined;
};
