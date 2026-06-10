import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProductDetailScreen from '../../screens/shop/ProductDetailScreen';
import WishlistScreen from '../../screens/wishlist/WishlistScreen';

export type WishlistStackParamList = {
  Wishlist: undefined;
  ProductDetail: { productId: string };
};

const Stack = createNativeStackNavigator<WishlistStackParamList>();

export default function WishlistStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}
