import { Text, View } from 'react-native';

import ScreenLayout from '../../components/layout/ScreenLayout';

export default function GetInvolvedScreen() {
  return (
    <ScreenLayout>
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-semibold text-gray-900">Get Involved</Text>
      </View>
    </ScreenLayout>
  );
}
