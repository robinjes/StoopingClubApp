import { Text, View } from 'react-native';

import ScreenLayout from '../../components/layout/ScreenLayout';

export default function ResourcesScreen() {
  return (
    <ScreenLayout>
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-semibold text-gray-900">Resources</Text>
      </View>
    </ScreenLayout>
  );
}
