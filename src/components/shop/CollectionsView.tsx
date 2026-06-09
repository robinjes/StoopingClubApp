import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import type { ShopifyCollection, ShopifyProduct } from '../../types/shopify';
import { colors } from '../../theme/colors';
import CollectionChips from './CollectionChips';
import ProductGrid from './ProductGrid';

type CollectionsViewProps = {
  collections: ShopifyCollection[];
  products: ShopifyProduct[];
};

export default function CollectionsView({ collections, products }: CollectionsViewProps) {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    if (!selectedCollectionId) {
      return products;
    }

    const collection = collections.find((item) => item.id === selectedCollectionId);
    return collection?.products ?? [];
  }, [collections, products, selectedCollectionId]);

  const header = (
    <View className="pb-2">
      <Text
        className="px-4 text-2xl text-brand"
        style={{ fontFamily: 'Georgia', color: colors.brand }}
      >
        Collections
      </Text>
      <Text className="px-4 pb-3 text-sm text-gray-600">
        Curated categories with quick-filter chips.
      </Text>
      <CollectionChips
        collections={collections}
        selectedId={selectedCollectionId}
        onSelect={setSelectedCollectionId}
      />
    </View>
  );

  return <ProductGrid products={filteredProducts} ListHeaderComponent={header} />;
}
