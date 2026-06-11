import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AboutScreen from '../../screens/shared/AboutScreen';

export type AboutStackParamList = {
  About: undefined;
};

const Stack = createNativeStackNavigator<AboutStackParamList>();

export default function AboutStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}
