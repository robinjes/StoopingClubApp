import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useOverlay } from '../../context/OverlayContext';
import AccountProfileScreen from '../../screens/account/AccountProfileScreen';
import CustomerSignInWebViewScreen from '../../screens/account/CustomerSignInWebViewScreen';
import SignInEmailScreen from '../../screens/account/SignInEmailScreen';
import SignInShopScreen from '../../screens/account/SignInShopScreen';
import PickupsScreen from '../../screens/pickups/PickupsScreen';

export type AccountStackParamList = {
  SignInShop: undefined;
  SignInEmail: undefined;
  CustomerSignIn: { mode?: 'shop' | 'email' } | undefined;
  Orders: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<AccountStackParamList>();

export default function AccountStack() {
  const { accountRoute, closeOverlay } = useOverlay();

  return (
    <Stack.Navigator
      key={accountRoute}
      initialRouteName={accountRoute}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="SignInShop" component={SignInShopScreen} />
      <Stack.Screen
        name="SignInEmail"
        component={SignInEmailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="CustomerSignIn"
        component={CustomerSignInWebViewScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen name="Orders">
        {() => <PickupsScreen onClose={closeOverlay} />}
      </Stack.Screen>
      <Stack.Screen name="Profile" component={AccountProfileScreen} />
    </Stack.Navigator>
  );
}
