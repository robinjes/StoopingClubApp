import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import StreakButton from '../streak/StreakButton';
import AccountDropdown from './AccountDropdown';
import CustomerAvatar from './CustomerAvatar';
import CartIconButton from '../feedback/CartIconButton';
import { useFeedback } from '../../context/FeedbackContext';
import { useCart } from '../../context/CartContext';
import { useCustomer } from '../../context/CustomerContext';
import { useOverlay } from '../../context/OverlayContext';
import { useTheme } from '../../context/ThemeContext';
import { navigateToShopTab } from '../../navigation/rootNavigation';

const HEADER_GREEN = '#00553A';

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
  const { haptic } = useFeedback();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  function handleBack() {
    if (onBack) {
      onBack();
      return;
    }
    navigation.goBack();
  }

  function handleGoShop() {
    closeOverlay();
    navigateToShopTab();
  }

  return (
    <View style={{ backgroundColor: HEADER_GREEN }}>
      <View
        style={{
          paddingTop: insets.top,
          paddingHorizontal: 16,
          paddingBottom: 10,
        }}
      >
        <View className="min-h-[44px] flex-row items-center justify-between">
          <View className="min-w-[88px] flex-row items-center gap-1">
            {showBack ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                className="p-1"
                onPress={handleBack}
              >
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </Pressable>
            ) : null}
            <StreakButton light />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go to shop"
            onPress={handleGoShop}
            className="flex-row items-center gap-2"
          >
            <Image
              source={require('../../../assets/stoopylogo.png')}
              className="h-8 w-8"
              resizeMode="contain"
              accessibilityLabel="Stooping Club"
            />
            <Text
              numberOfLines={1}
              className="text-base font-bold text-white"
              style={{ fontFamily: 'Georgia' }}
            >
              Stooping Club
            </Text>
          </Pressable>

          <View className="min-w-[88px] flex-row items-center justify-end gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Account"
              className="p-0.5"
              onPress={() => setAccountMenuOpen(true)}
            >
              {isAuthenticated && profile ? (
                <CustomerAvatar profile={profile} colors={colors} size={28} />
              ) : (
                <Ionicons name="person-outline" size={22} color="#FFFFFF" />
              )}
            </Pressable>

            <CartIconButton
              itemCount={itemCount}
              onPress={() => {
                haptic('selection');
                openOverlay('cart');
              }}
            />
          </View>
        </View>

      </View>

      <AccountDropdown
        visible={accountMenuOpen}
        onClose={() => setAccountMenuOpen(false)}
        anchorTop={insets.top + 54}
        anchorRight={16}
      />
    </View>
  );
}
