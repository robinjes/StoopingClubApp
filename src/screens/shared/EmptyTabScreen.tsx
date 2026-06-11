import { View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';

/** Placeholder for tabs that open an overlay instead of navigating to content. */
export default function EmptyTabScreen() {
  const { colors } = useTheme();
  return <View style={{ flex: 1, backgroundColor: colors.cream }} />;
}
