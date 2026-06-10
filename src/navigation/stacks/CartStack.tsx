import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CartScreen from '../../screens/shared/CartScreen';
import CheckoutScreen from '../../screens/shared/CheckoutScreen';

export type CartStackParamList = {
  Cart: undefined;
  Checkout: { checkoutUrl: string };
};

const Stack = createNativeStackNavigator<CartStackParamList>();

export default function CartStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}
