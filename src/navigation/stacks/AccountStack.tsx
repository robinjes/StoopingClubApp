import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useOverlay } from '../../context/OverlayContext';
import AccountProfileScreen from '../../screens/account/AccountProfileScreen';
import OrdersScreen from '../../screens/account/OrdersScreen';
import SignInShopScreen from '../../screens/account/SignInShopScreen';

export type AccountStackParamList = {
  SignInShop: undefined;
  Orders: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<AccountStackParamList>();

export default function AccountStack() {
  const { accountRoute } = useOverlay();

  return (
    <Stack.Navigator
      key={accountRoute}
      initialRouteName={accountRoute}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="SignInShop" component={SignInShopScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="Profile" component={AccountProfileScreen} />
    </Stack.Navigator>
  );
}
