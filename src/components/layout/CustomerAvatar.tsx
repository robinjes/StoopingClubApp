import { Text, View } from 'react-native';

import type { CustomerProfile } from '../../types/customer';
import type { ThemeColors } from '../../theme/colors';
import { getCustomerInitial } from '../../utils/customerDisplay';

type CustomerAvatarProps = {
  profile: CustomerProfile | null;
  colors: ThemeColors;
  size?: number;
};

export default function CustomerAvatar({ profile, colors, size = 32 }: CustomerAvatarProps) {
  const fontSize = Math.round(size * 0.42);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.brandDark,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text className="font-semibold text-white" style={{ fontSize }}>
        {getCustomerInitial(profile)}
      </Text>
    </View>
  );
}
