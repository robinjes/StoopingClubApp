import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PickupsScreen from '../../screens/pickups/PickupsScreen';
import OrderMessagePreviewScreen from '../../screens/shared/OrderMessagePreviewScreen';
import ProductDetailScreen from '../../screens/shop/ProductDetailScreen';
import ShopScreen from '../../screens/shop/ShopScreen';

export type OrderMessagePreviewParams = {
  items: Array<{ title: string; quantity: number }>;
  orderedAt: string;
};

export type ShopStackParamList = {
  Shop: undefined;
  ProductDetail: { productId: string };
  Pickups: undefined;
  OrderMessagePreview: OrderMessagePreviewParams;
};

const Stack = createNativeStackNavigator<ShopStackParamList>();

export default function ShopStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Shop" component={ShopScreen} />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Pickups"
        component={PickupsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="OrderMessagePreview"
        component={OrderMessagePreviewScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}
