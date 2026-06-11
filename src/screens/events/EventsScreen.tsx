import { Text, View } from 'react-native';

import ScreenLayout from '../../components/layout/ScreenLayout';

export default function EventsScreen() {
  return (
    <ScreenLayout>
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-semibold text-gray-900 dark:text-gray-100">Events</Text>
      </View>
    </ScreenLayout>
  );
}
