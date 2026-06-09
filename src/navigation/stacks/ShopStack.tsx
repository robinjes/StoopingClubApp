import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ShopScreen from '../../screens/shop/ShopScreen';

export type ShopStackParamList = {
  Shop: undefined;
};

const Stack = createNativeStackNavigator<ShopStackParamList>();

export default function ShopStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Shop" component={ShopScreen} />
    </Stack.Navigator>
  );
}
