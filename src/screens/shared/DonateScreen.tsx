import { Text, View } from 'react-native';

import ScreenLayout from '../../components/layout/ScreenLayout';

export default function DonateScreen() {
  return (
    <ScreenLayout>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-xl font-semibold text-gray-900">Donate</Text>
        <Text className="mt-2 text-center text-sm text-gray-500">
          Donation flow template. Connect a Shopify product, payment link, or external
          donation provider here.
        </Text>
      </View>
    </ScreenLayout>
  );
}
