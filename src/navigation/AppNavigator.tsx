import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CartScreen from '../screens/shared/CartScreen';
import ContactScreen from '../screens/shared/ContactScreen';
import DonateScreen from '../screens/shared/DonateScreen';
import TabNavigator from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="Donate" component={DonateScreen} />
      <Stack.Screen name="Contact" component={ContactScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
    </Stack.Navigator>
  );
}
