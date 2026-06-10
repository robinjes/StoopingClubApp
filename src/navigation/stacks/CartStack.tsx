import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CartScreen from '../../screens/shared/CartScreen';
import CheckoutScreen from '../../screens/shared/CheckoutScreen';
import OrderConfirmationScreen from '../../screens/shared/OrderConfirmationScreen';

export type CartStackParamList = {
  Cart: undefined;
  Checkout: { checkoutUrl: string };
  OrderConfirmation: undefined;
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
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
        options={{ animation: 'fade' }}
      />
    </Stack.Navigator>
  );
}
