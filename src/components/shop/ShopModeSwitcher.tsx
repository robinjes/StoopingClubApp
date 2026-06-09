import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

export type ShopMode = 'grid' | 'collections' | 'stroll';

type ShopModeOption = {
  id: ShopMode;
  label: string;
  description: string;
  icon: ComponentProps<typeof Ionicons>['name'];
};

const MODES: ShopModeOption[] = [
  {
    id: 'grid',
    label: 'Grid',
    description: 'All inventory in a clean scrollable grid.',
    icon: 'grid-outline',
  },
  {
    id: 'collections',
    label: 'Collections',
    description: 'Curated categories with quick-filter chips.',
    icon: 'layers-outline',
  },
  {
    id: 'stroll',
    label: 'Stroll',
    description: 'One random item at a time. Like Reels.',
    icon: 'shuffle-outline',
  },
];

type ShopModeSwitcherProps = {
  mode: ShopMode;
  onModeChange: (mode: ShopMode) => void;
};

export default function ShopModeSwitcher({ mode, onModeChange }: ShopModeSwitcherProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-3 px-4 py-4"
    >
      {MODES.map((option) => {
        const isActive = mode === option.id;

        return (
          <Pressable
            key={option.id}
            onPress={() => onModeChange(option.id)}
            className="w-44 rounded-2xl border bg-white p-4"
            style={{
              borderColor: isActive ? colors.brand : colors.border,
              backgroundColor: isActive ? '#F4F8EF' : colors.background,
            }}
          >
            <Ionicons name={option.icon} size={22} color={colors.brand} />
            <Text
              className="mt-3 text-lg text-brand"
              style={{ fontFamily: 'Georgia', color: colors.brand }}
            >
              {option.label}
            </Text>
            <Text className="mt-1 text-xs leading-4 text-gray-600">{option.description}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
