import { Pressable, ScrollView, Text } from 'react-native';

import type { ShopifyCollection } from '../../types/shopify';
import { colors } from '../../theme/colors';

type CollectionChipsProps = {
  collections: ShopifyCollection[];
  selectedId: string | null;
  onSelect: (collectionId: string | null) => void;
};

export default function CollectionChips({
  collections,
  selectedId,
  onSelect,
}: CollectionChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-4 pb-3"
    >
      <Pressable
        onPress={() => onSelect(null)}
        className="rounded-full border px-4 py-2"
        style={{
          borderColor: selectedId === null ? colors.brand : colors.border,
          backgroundColor: selectedId === null ? '#F4F8EF' : '#FFFFFF',
        }}
      >
        <Text
          className="text-sm font-medium"
          style={{ color: selectedId === null ? colors.brand : colors.textMuted }}
        >
          All
        </Text>
      </Pressable>

      {collections.map((collection) => {
        const isSelected = selectedId === collection.id;

        return (
          <Pressable
            key={collection.id}
            onPress={() => onSelect(collection.id)}
            className="rounded-full border px-4 py-2"
            style={{
              borderColor: isSelected ? colors.brand : colors.border,
              backgroundColor: isSelected ? '#F4F8EF' : '#FFFFFF',
            }}
          >
            <Text
              className="text-sm font-medium"
              style={{ color: isSelected ? colors.brand : colors.textMuted }}
            >
              {collection.title}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
