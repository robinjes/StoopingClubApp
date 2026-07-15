import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';

export type ShopMode = 'grid' | 'collections' | 'stroll';

type ShopModeOption = {
  id: ShopMode;
  label: string;
  accessibilityLabel?: string;
  icon: ComponentProps<typeof Ionicons>['name'];
};

const MODES: ShopModeOption[] = [
  { id: 'grid', label: 'Grid', icon: 'grid-outline' },
  { id: 'collections', label: 'Collections', icon: 'layers-outline' },
  { id: 'stroll', label: 'Stroll', icon: 'shuffle-outline' },
];

type ShopModeSwitcherProps = {
  mode: ShopMode;
  onModeChange: (mode: ShopMode) => void;
};

export default function ShopModeSwitcher({ mode, onModeChange }: ShopModeSwitcherProps) {
  const { colors } = useTheme();
  return (
    <View className="px-4 pb-3 pt-4">
      <View
        className="flex-row rounded-xl p-1"
        style={{ backgroundColor: '#EBE6DC' }}
      >
        {MODES.map((option) => {
          const isActive = mode === option.id;

          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityLabel={option.accessibilityLabel ?? option.label}
              accessibilityState={{ selected: isActive }}
              onPress={() => onModeChange(option.id)}
              className="flex-1 flex-row items-center justify-center gap-1 rounded-lg py-2.5"
              style={{
                backgroundColor: isActive ? colors.background : 'transparent',
                shadowColor: isActive ? '#000' : 'transparent',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isActive ? 0.08 : 0,
                shadowRadius: 2,
                elevation: isActive ? 1 : 0,
              }}
            >
              <Ionicons
                name={option.icon}
                size={15}
                color={isActive ? colors.brand : colors.textMuted}
              />
              <Text
                className="text-xs font-medium"
                style={{ color: isActive ? colors.brand : colors.textMuted }}
                numberOfLines={1}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
