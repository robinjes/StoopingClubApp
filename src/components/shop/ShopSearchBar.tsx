import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, TextInput, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';

type ShopSearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  resultCount?: number;
};

export default function ShopSearchBar({ value, onChangeText, resultCount }: ShopSearchBarProps) {
  const { colors } = useTheme();
  const hasQuery = value.trim().length > 0;

  return (
    <View>
      <View className="relative">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Search furniture, books, kitchenware..."
          placeholderTextColor={colors.textMuted}
          className="rounded-xl border bg-white dark:bg-gray-950 px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
          style={{
            borderColor: hasQuery ? colors.brand : colors.border,
            backgroundColor: hasQuery ? colors.cardActive : colors.background,
            paddingRight: hasQuery ? 72 : 44,
          }}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCorrect={false}
          autoCapitalize="none"
        />

        {hasQuery ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            className="absolute bottom-0 right-10 top-0 justify-center px-2"
            onPress={() => onChangeText('')}
          >
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}

        <View
          pointerEvents="none"
          className="absolute bottom-0 right-0 top-0 justify-center px-3"
        >
          <Ionicons name="search" size={20} color={colors.brand} />
        </View>
      </View>

      {hasQuery && typeof resultCount === 'number' ? (
        <Text className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {resultCount === 0
            ? 'No close matches — try fewer or different words'
            : `${resultCount} ${resultCount === 1 ? 'match' : 'matches'} found`}
        </Text>
      ) : null}
    </View>
  );
}
