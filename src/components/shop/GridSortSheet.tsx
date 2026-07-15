import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import {
  GRID_SORT_LABELS,
  GRID_SORT_OPTIONS,
  type GridSortOption,
} from '../../utils/shopFilters';

type GridSortSheetProps = {
  visible: boolean;
  sort: GridSortOption;
  onClose: () => void;
  onSelect: (sort: GridSortOption) => void;
};

export default function GridSortSheet({ visible, sort, onClose, onSelect }: GridSortSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(17, 24, 39, 0.45)' }}>
        <Pressable className="flex-1" onPress={onClose} accessibilityLabel="Close sort options" />

        <View
          className="rounded-t-3xl bg-white dark:bg-gray-950 px-5 pt-5"
          style={{
            maxHeight: height * 0.7,
            paddingBottom: Math.max(insets.bottom, 16),
          }}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Text
              className="text-xl text-gray-900 dark:text-gray-100"
              style={{ fontFamily: 'Georgia' }}
            >
              Sort
            </Text>
            <Pressable
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: '#F3F4F6' }}
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          {GRID_SORT_OPTIONS.map((option) => {
            const selected = sort === option;

            return (
              <Pressable
                key={option}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
                className="mb-2 flex-row items-center justify-between rounded-2xl border px-4 py-3.5"
                style={{
                  backgroundColor: selected ? colors.cardActive : colors.background,
                  borderColor: selected ? colors.brand : colors.border,
                }}
              >
                <Text
                  className="text-base"
                  style={{
                    color: colors.text,
                    fontWeight: selected ? '600' : '500',
                  }}
                >
                  {GRID_SORT_LABELS[option]}
                </Text>
                {selected ? (
                  <Ionicons name="checkmark-circle" size={22} color={colors.brand} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}
