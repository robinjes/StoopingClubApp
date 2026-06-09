import { createNativeStackNavigator } from '@react-navigation/native-stack';

import GetInvolvedScreen from '../../screens/involved/GetInvolvedScreen';

export type InvolvedStackParamList = {
  GetInvolved: undefined;
};

const Stack = createNativeStackNavigator<InvolvedStackParamList>();

export default function InvolvedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GetInvolved" component={GetInvolvedScreen} options={{ title: 'Get Involved' }} />
    </Stack.Navigator>
  );
}
