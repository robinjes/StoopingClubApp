import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AccountDropdown from './AccountDropdown';
import CustomerAvatar from './CustomerAvatar';
import DevNotificationTestButtons from './DevNotificationTestButtons';
import { useCart } from '../../context/CartContext';
import { useCustomer } from '../../context/CustomerContext';
import { useOverlay } from '../../context/OverlayContext';
import { useTheme } from '../../context/ThemeContext';
import { navigateToHomeTab } from '../../navigation/rootNavigation';

type AppNavbarProps = {
  showBack?: boolean;
  onBack?: () => void;
};

export default function AppNavbar({ showBack = false, onBack }: AppNavbarProps) {
  const navigation = useNavigation();
  const { openOverlay, closeOverlay } = useOverlay();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { itemCount } = useCart();
  const { isAuthenticated, profile } = useCustomer();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  function handleBack() {
    if (onBack) {
      onBack();
      return;
    }
    navigation.goBack();
  }

  function handleGoHome() {
    closeOverlay();
    navigateToHomeTab();
  }

  return (
    <View
      className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
      style={{ paddingTop: insets.top, borderBottomColor: colors.border, backgroundColor: colors.background }}
    >
      <View className="h-14 flex-row items-center px-4">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          {showBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              className="p-1"
              onPress={handleBack}
            >
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go to home"
            onPress={handleGoHome}
          >
            <Image
              source={require('../../../assets/stoopylogo.png')}
              className="h-9 w-9"
              resizeMode="contain"
              accessibilityLabel="Stooping Club"
            />
          </Pressable>
          {__DEV__ && !showBack ? <DevNotificationTestButtons /> : null}
        </View>

        <Text
          pointerEvents="none"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          className="shrink px-3 text-center text-lg font-semibold"
          style={{ fontFamily: 'Georgia', color: colors.brandDark }}
        >
          Stooping Club
        </Text>

        <View className="min-w-0 flex-1 flex-row items-center justify-end gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Contact us"
            className="p-1"
            onPress={() => openOverlay('contact')}
          >
            <Ionicons name="mail-outline" size={22} color={colors.brand} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Account"
            className="p-0.5"
            onPress={() => setAccountMenuOpen(true)}
          >
            {isAuthenticated && profile ? (
              <CustomerAvatar profile={profile} colors={colors} size={30} />
            ) : (
              <Ionicons name="person-outline" size={22} color={colors.brand} />
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cart"
            className="p-1"
            onPress={() => openOverlay('cart')}
          >
            <View>
              <Ionicons name="cart-outline" size={22} color={colors.brand} />
              {itemCount > 0 ? (
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
          </Pressable>
        </View>
      </View>

      <AccountDropdown
        visible={accountMenuOpen}
        onClose={() => setAccountMenuOpen(false)}
        anchorTop={insets.top + 56}
        anchorRight={16}
      />
    </View>
  );
}
