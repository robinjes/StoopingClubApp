import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';

import {
  CollectionsStackParamList,
  GridStackParamList,
  StrollStackParamList,
} from '../navigation/types';

type Props = NativeStackScreenProps<
  GridStackParamList | CollectionsStackParamList | StrollStackParamList,
  'ProductDetail'
>;

export default function ProductDetailScreen({ route }: Props) {
  const { productId, productName } = route.params;

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-2xl font-bold text-gray-900">{productName}</Text>
      <Text className="mt-2 text-base text-gray-500">ID: {productId}</Text>
    </View>
  );
}
