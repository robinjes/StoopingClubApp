import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ResourcesScreen from '../../screens/resources/ResourcesScreen';

export type ResourcesStackParamList = {
  Resources: undefined;
};

const Stack = createNativeStackNavigator<ResourcesStackParamList>();

export default function ResourcesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Resources" component={ResourcesScreen} />
    </Stack.Navigator>
  );
}
