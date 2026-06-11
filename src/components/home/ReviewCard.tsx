import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import type { CustomerReview } from '../../data/homeContent';
import type { ThemeColors } from '../../theme/colors';

type ReviewCardProps = {
  review: CustomerReview;
  colors: ThemeColors;
};

export default function ReviewCard({ review, colors }: ReviewCardProps) {
  return (
    <View
      className="mb-4 rounded-3xl border px-5 py-6"
      style={{ borderColor: colors.border, backgroundColor: colors.background }}
    >
      <View
        className="mx-auto mb-4 h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.brandDark }}
      >
        <Text className="text-base font-semibold text-white">{review.initials}</Text>
      </View>

      <Text
        className="text-center text-xl font-semibold"
        style={{ fontFamily: 'Georgia', color: colors.text }}
      >
        {review.name}
      </Text>

      <View
        className="mt-2 self-center rounded-full px-3 py-1"
        style={{ backgroundColor: colors.surfaceMuted }}
      >
        <Text className="text-xs font-medium" style={{ color: colors.textMuted }}>
          {review.role}
        </Text>
      </View>

      <View className="mt-3 flex-row items-center justify-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <Ionicons
            key={`${review.id}-star-${index}`}
            name={index < review.rating ? 'star' : 'star-outline'}
            size={14}
            color={index < review.rating ? colors.brand : colors.border}
          />
        ))}
      </View>

      <Text
        className="mt-4 text-center text-base leading-6"
        style={{ color: colors.textMuted }}
      >
        &ldquo;{review.quote}&rdquo;
      </Text>
    </View>
  );
}
