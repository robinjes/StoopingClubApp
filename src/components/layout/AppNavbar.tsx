import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCart } from '../../context/CartContext';
import { useOverlay, type OverlayScreen } from '../../context/OverlayContext';
import type { ShopStackParamList } from '../../navigation/stacks/ShopStack';
import type { TabParamList } from '../../navigation/TabNavigator';
import { colors } from '../../theme/colors';

type RootNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<ShopStackParamList>,
  BottomTabNavigationProp<TabParamList>
>;

type NavAction = {
  label: string;
  overlay: OverlayScreen;
  icon: keyof typeof Ionicons.glyphMap;
};

const NAV_ACTIONS: NavAction[] = [
  { label: 'Donate', overlay: 'donate', icon: 'heart-outline' },
  { label: 'Contact Us', overlay: 'contact', icon: 'mail-outline' },
  { label: 'Cart', overlay: 'cart', icon: 'cart-outline' },
];

type AppNavbarProps = {
  showBack?: boolean;
};

export default function AppNavbar({ showBack = false }: AppNavbarProps) {
  const navigation = useNavigation<RootNavigation>();
  const { openOverlay } = useOverlay();
  const insets = useSafeAreaInsets();
  const { itemCount } = useCart();

  return (
    <View
      className="border-b border-gray-200 bg-white"
      style={{ paddingTop: insets.top }}
    >
      <View className="h-14 flex-row items-center justify-between px-4">
        <View className="flex-row items-center gap-2">
          {showBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              className="p-1"
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go to home"
            onPress={() => navigation.navigate('HomeTab')}
          >
            <Image
              source={require('../../../assets/stoopylogo.png')}
              className="h-9 w-9"
              resizeMode="contain"
              accessibilityLabel="Stooping Club"
            />
          </Pressable>
        </View>

        <View className="flex-row items-center gap-1">
          {NAV_ACTIONS.map((action) => {
            const isCart = action.overlay === 'cart';

            return (
              <Pressable
                key={action.overlay}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                className="items-center px-2 py-1"
                onPress={() => openOverlay(action.overlay)}
              >
                <View>
                  <Ionicons name={action.icon} size={20} color={colors.brand} />
                  {isCart && itemCount > 0 ? (
                    <View
                      className="absolute -right-2 -top-1 min-w-[16px] items-center rounded-full px-1"
                      style={{ backgroundColor: colors.brand }}
                    >
                      <Text className="text-[10px] font-semibold text-white">
                        {itemCount > 9 ? '9+' : itemCount}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text className="mt-0.5 text-[10px] font-medium" style={{ color: colors.brand }}>
                  {action.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
