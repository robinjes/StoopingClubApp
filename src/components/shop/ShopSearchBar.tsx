import { Ionicons } from '@expo/vector-icons';
import { TextInput, View } from 'react-native';

import { colors } from '../../theme/colors';

type ShopSearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export default function ShopSearchBar({ value, onChangeText }: ShopSearchBarProps) {
  return (
    <View className="relative">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search..."
        placeholderTextColor={colors.textMuted}
        className="rounded-lg border border-gray-200 bg-white px-4 py-3 pr-12 text-sm text-gray-900"
        style={{ borderColor: colors.border }}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      <View
        pointerEvents="none"
        className="absolute bottom-0 right-0 top-0 justify-center px-3"
      >
        <Ionicons name="search" size={20} color={colors.brand} />
      </View>
    </View>
  );
}
