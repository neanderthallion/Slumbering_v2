import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './navigation.types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();
