import { Text, View } from 'react-native';

import ScreenLayout from '../../components/layout/ScreenLayout';

export default function ContactScreen() {
  return (
    <ScreenLayout>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-xl font-semibold text-gray-900">Contact Us</Text>
        <Text className="mt-2 text-center text-sm text-gray-500">
          Contact form template. Wire up email, CRM, or Shopify customer API here.
        </Text>
      </View>
    </ScreenLayout>
  );
}
