import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, Text, View } from 'react-native';

import ScreenLayout from '../../components/layout/ScreenLayout';
import { useCustomer } from '../../context/CustomerContext';
import { useOverlay } from '../../context/OverlayContext';
import { useTheme } from '../../context/ThemeContext';
import type { AccountStackParamList } from '../../navigation/stacks/AccountStack';

const SHOP_PURPLE = '#5433EB';

type SignInShopNavigation = NativeStackNavigationProp<AccountStackParamList, 'SignInShop'>;

export default function SignInShopScreen() {
  const { colors } = useTheme();
  const { closeOverlay } = useOverlay();
  const navigation = useNavigation<SignInShopNavigation>();
  const { isConfigured, error } = useCustomer();

  return (
    <ScreenLayout showBack onBack={() => closeOverlay()}>
      <View className="flex-1 px-6 pt-8">
        <Text
          className="text-center text-3xl"
          style={{ fontFamily: 'Georgia', color: colors.text }}
        >
          Account
        </Text>

        <Text className="mt-3 text-center text-base leading-6" style={{ color: colors.textMuted }}>
          Sign in with Shop to access your Stooping Club orders, pickups, and profile in one tap.
        </Text>

        {error ? (
          <Text className="mt-4 text-center text-sm text-red-600">{error}</Text>
        ) : null}

        {!isConfigured ? (
          <View className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <Text className="text-sm leading-5 text-amber-900">
              Customer login is not configured yet. Add your Customer Account API client ID to enable
              sign in.
            </Text>
          </View>
        ) : (
          <Pressable
            className="mt-8 items-center rounded-full py-4"
            style={{ backgroundColor: SHOP_PURPLE }}
            onPress={() => navigation.navigate('CustomerSignIn', { mode: 'shop' })}
          >
            <Text className="text-base font-semibold text-white">
              Sign in with <Text style={{ fontWeight: '800' }}>shop</Text>
            </Text>
          </Pressable>
        )}

        <Pressable className="mt-5 items-center py-2" onPress={() => navigation.navigate('SignInEmail')}>
          <Text className="text-sm font-medium" style={{ color: colors.brand }}>
            Other sign in options
          </Text>
        </Pressable>
      </View>
    </ScreenLayout>
  );
}
