import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, Text, View } from 'react-native';

import { GridStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<GridStackParamList, 'Grid'>;

const PRODUCTS = [
  { id: 'grid-1', name: 'Vintage Lamp' },
  { id: 'grid-2', name: 'Oak Side Table' },
  { id: 'grid-3', name: 'Ceramic Vase' },
];

export default function GridScreen({ navigation }: Props) {
  return (
    <View className="flex-1 bg-gray-50 px-4 pt-4">
      <Text className="mb-4 text-2xl font-bold text-gray-900">Grid</Text>
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
