import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  Text,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
} from 'react-native';

import { HAPPY_CUSTOMER_PHOTOS, type HappyCustomerPhoto } from '../../data/homeContent';
import type { ThemeColors } from '../../theme/colors';

type HappyCustomersGalleryProps = {
  colors: ThemeColors;
};

function getImageDimensions(source: ImageSourcePropType): { width: number; height: number } {
  const resolved = Image.resolveAssetSource(source);
  return {
    width: resolved.width,
    height: resolved.height,
  };
}

function getExpandedImageSize(
  source: ImageSourcePropType,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const { width, height } = getImageDimensions(source);
  const scale = Math.min(maxWidth / width, maxHeight / height, 1);
  return {
    width: width * scale,
    height: height * scale,
  };
}

export default function HappyCustomersGallery({ colors }: HappyCustomersGalleryProps) {
  const { width, height } = useWindowDimensions();
  const [expandedPhoto, setExpandedPhoto] = useState<HappyCustomerPhoto | null>(null);

  const horizontalPadding = 32;
  const gap = 10;
  const cardWidth = (width - horizontalPadding - gap * 2) / 3;
  const cardHeight = cardWidth * 1.25;

  const expandedImageSize = useMemo(() => {
    if (!expandedPhoto) {
      return null;
    }

    const maxWidth = width - 48;
    const maxHeight = height - 180;
    return getExpandedImageSize(expandedPhoto.source, maxWidth, maxHeight);
  }, [expandedPhoto, width, height]);

  return (
    <>
      <View className="flex-row" style={{ gap }}>
        {HAPPY_CUSTOMER_PHOTOS.map((photo) => (
          <Pressable
            key={photo.id}
            accessibilityRole="button"
            accessibilityLabel="View happy customer photo"
            onPress={() => setExpandedPhoto(photo)}
            className="overflow-hidden rounded-2xl border"
            style={{
              width: cardWidth,
              height: cardHeight,
              borderColor: colors.border,
              backgroundColor: colors.background,
            }}
          >
            <Image
              source={photo.source}
              resizeMode="cover"
              style={{ width: '100%', height: '100%' }}
            />
          </Pressable>
        ))}
      </View>

      <Modal
        visible={expandedPhoto !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setExpandedPhoto(null)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/80 px-6"
          onPress={() => setExpandedPhoto(null)}
        >
          <Pressable onPress={(event) => event.stopPropagation()}>
            {expandedPhoto && expandedImageSize ? (
              <Image
                source={expandedPhoto.source}
                accessibilityLabel="Happy Stooping Club customer"
                resizeMode="contain"
                style={{
                  width: expandedImageSize.width,
                  height: expandedImageSize.height,
                }}
              />
            ) : null}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close photo"
            className="mt-5 flex-row items-center gap-2 rounded-full px-5 py-2.5"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            onPress={() => setExpandedPhoto(null)}
          >
            <Ionicons name="close" size={18} color="#FFFFFF" />
            <Text className="text-sm font-medium text-white">Close</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
