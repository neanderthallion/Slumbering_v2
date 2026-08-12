import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation.types';

import { HomeScreen } from '../screens/Home/HomeScreen';
import { GoalPickerScreen } from '../screens/GoalPicker/GoalPickerScreen';
import { TonightConfirmationScreen } from '../screens/TonightConfirmation/TonightConfirmationScreen';
import { CheckInScreen } from '../screens/CheckIn/CheckInScreen';
import { JourneyScreen } from '../screens/Journey/JourneyScreen';
import { AddPastRecordScreen } from '../screens/AddPastRecord/AddPastRecordScreen';
import { SettingsScreen } from '../screens/Settings/SettingsScreen';
import { SleepScienceScreen } from '../screens/SleepScience/SleepScienceScreen';
import { BedtimeScreen } from '../screens/Bedtime/BedtimeScreen';

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
      <Stack.Screen name="SleepScience" component={SleepScienceScreen} />
      <Stack.Screen name="Bedtime" component={BedtimeScreen} />
    </Stack.Navigator>
  );
}
