import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BranchDirectorApplicationScreen from '../../screens/involved/BranchDirectorApplicationScreen';
import GetInvolvedScreen from '../../screens/involved/GetInvolvedScreen';

export type InvolvedStackParamList = {
  GetInvolved: undefined;
  BranchDirectorApplication: undefined;
};

const Stack = createNativeStackNavigator<InvolvedStackParamList>();

export default function InvolvedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GetInvolved" component={GetInvolvedScreen} options={{ title: 'Get Involved' }} />
      <Stack.Screen
        name="BranchDirectorApplication"
        component={BranchDirectorApplicationScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}
