import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

import { HomeScreen } from '../screens/Home/HomeScreen';
import { GoalPickerScreen } from '../screens/GoalPicker/GoalPickerScreen';
import { TonightConfirmationScreen } from '../screens/TonightConfirmation/TonightConfirmationScreen';
import { CheckInScreen } from '../screens/CheckIn/CheckInScreen';
import { JourneyScreen } from '../screens/Journey/JourneyScreen';
import { AddPastRecordScreen } from '../screens/Journey/AddPastRecordScreen';
import { SettingsScreen } from '../screens/Settings/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="GoalPicker" component={GoalPickerScreen} />
      <Stack.Screen name="TonightConfirmation" component={TonightConfirmationScreen} />
      <Stack.Screen name="CheckIn" component={CheckInScreen} />
      <Stack.Screen name="Journey" component={JourneyScreen} />
      <Stack.Screen name="AddPastRecord" component={AddPastRecordScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
