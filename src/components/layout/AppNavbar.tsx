import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCart } from '../../context/CartContext';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type AppNavbarProps = {
  showBack?: boolean;
};

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

type NavAction = {
  label: string;
  route: keyof Pick<RootStackParamList, 'Donate' | 'Contact' | 'Cart'>;
  icon: keyof typeof Ionicons.glyphMap;
};

const NAV_ACTIONS: NavAction[] = [
  { label: 'Donate', route: 'Donate', icon: 'heart-outline' },
  { label: 'Contact Us', route: 'Contact', icon: 'mail-outline' },
  { label: 'Cart', route: 'Cart', icon: 'cart-outline' },
];

export default function AppNavbar({ showBack = false }: AppNavbarProps) {
  const navigation = useNavigation<RootNavigation>();
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
              className="mr-1 p-1"
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </Pressable>
          ) : null}
          <Pressable onPress={() => navigation.navigate('MainTabs')}>
            <Text className="text-lg font-bold" style={{ color: colors.brand }}>
              Stooping Club
            </Text>
          </Pressable>
        </View>

        <View className="flex-row items-center gap-1">
          {NAV_ACTIONS.map((action) => {
            const isCart = action.route === 'Cart';

            return (
              <Pressable
                key={action.route}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                className="items-center px-2 py-1"
                onPress={() => navigation.navigate(action.route)}
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
