import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProductDetailScreen from '../../screens/shop/ProductDetailScreen';
import ShopScreen from '../../screens/shop/ShopScreen';

export type ShopStackParamList = {
  Shop: undefined;
  ProductDetail: { productId: string };
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
    </Stack.Navigator>
  );
}
