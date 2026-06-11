import { Text, View } from 'react-native';

const TAN_BAR = '#E6D5B8';

export default function ShopReminderBar() {
  return (
    <View
      className="border-y border-black px-4 py-2.5"
      style={{ backgroundColor: TAN_BAR }}
    >
      <Text className="text-right text-sm text-black">
        Happy Stooping! Limit of 10 items per person per week.
      </Text>
    </View>
  );
}
