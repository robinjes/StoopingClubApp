import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, Text, View } from 'react-native';

import { CollectionsStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<CollectionsStackParamList, 'Collections'>;

const PRODUCTS = [
  { id: 'collection-1', name: 'Brooklyn Finds' },
  { id: 'collection-2', name: 'Weekend Stoops' },
  { id: 'collection-3', name: 'Saved Gems' },
];

export default function CollectionsScreen({ navigation }: Props) {
  return (
    <View className="flex-1 bg-gray-50 px-4 pt-4">
      <Text className="mb-4 text-2xl font-bold text-gray-900">Collections</Text>
      {PRODUCTS.map((product) => (
        <Pressable
          key={product.id}
          className="mb-3 rounded-xl bg-white p-4 shadow-sm active:bg-gray-100"
          onPress={() =>
            navigation.navigate('ProductDetail', {
              productId: product.id,
              productName: product.name,
            })
          }
        >
          <Text className="text-base font-medium text-gray-900">{product.name}</Text>
        </Pressable>
      ))}
    </View>
  );
}
