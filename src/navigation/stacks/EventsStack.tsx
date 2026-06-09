import { createNativeStackNavigator } from '@react-navigation/native-stack';

import EventsScreen from '../../screens/events/EventsScreen';

export type EventsStackParamList = {
  Events: undefined;
};

const Stack = createNativeStackNavigator<EventsStackParamList>();

export default function EventsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Events" component={EventsScreen} />
    </Stack.Navigator>
  );
}
