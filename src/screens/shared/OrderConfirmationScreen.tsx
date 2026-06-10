import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, Text, View } from 'react-native';

import ScreenLayout from '../../components/layout/ScreenLayout';
import { useOverlay } from '../../context/OverlayContext';
import { getCurrentPickupSite } from '../../data/pickupSeason';
import type { CartStackParamList } from '../../navigation/stacks/CartStack';
import { navigateToShopTab } from '../../navigation/rootNavigation';
import { colors } from '../../theme/colors';

type OrderConfirmationScreenProps = NativeStackScreenProps<CartStackParamList, 'OrderConfirmation'>;

export default function OrderConfirmationScreen({ navigation }: OrderConfirmationScreenProps) {
  const { closeOverlay } = useOverlay();
  const pickupSite = getCurrentPickupSite();

  return (
    <ScreenLayout showBack>
      <View className="flex-1 px-4 pt-6">
        <View className="items-center">
          <View
            className="mb-5 h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.cardActive }}
          >
            <Ionicons name="checkmark-circle" size={48} color={colors.brand} />
          </View>

          <Text
            className="text-center text-2xl text-gray-900"
            style={{ fontFamily: 'Georgia' }}
          >
            Order confirmed
          </Text>
          <Text className="mt-3 text-center text-base leading-6 text-gray-600">
            Thanks for supporting Stooping Club. We&apos;ll see you at pickup.
          </Text>
        </View>

        <View
          className="mt-8 rounded-2xl border px-4 py-4"
          style={{ borderColor: colors.border, backgroundColor: colors.background }}
        >
          <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Pickup location
          </Text>
          <Text className="mt-2 text-lg font-semibold text-gray-900">{pickupSite.name}</Text>
          <Text className="mt-1 text-sm text-gray-600">{pickupSite.address}</Text>
          <Text className="mt-3 text-sm leading-5 text-gray-500">
            Pickup is on Sunday. We&apos;ll send you a reminder that morning.
          </Text>
        </View>

        <View className="mt-auto gap-3 pb-4">
          <Pressable
            className="items-center rounded-xl py-4"
            style={{ backgroundColor: colors.brand }}
            onPress={() => {
              closeOverlay();
              navigateToShopTab();
            }}
          >
            <Text className="text-base font-semibold text-white">Back to shop</Text>
          </Pressable>

          <Pressable
            className="items-center rounded-xl border py-4"
            style={{ borderColor: colors.border, backgroundColor: colors.background }}
            onPress={() => navigation.navigate('Cart')}
          >
            <Text className="text-base font-semibold text-gray-700">View cart</Text>
          </Pressable>
        </View>
      </View>
    </ScreenLayout>
  );
}
