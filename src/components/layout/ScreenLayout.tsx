import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNavLayout } from '../../context/NavLayoutContext';
import { useOverlay } from '../../context/OverlayContext';
import { STOOPY_BAR_HEIGHT } from '../../navigation/constants';
import AppNavbar from './AppNavbar';

type ScreenLayoutProps = {
  children: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
};

export default function ScreenLayout({ children, showBack = false, onBack }: ScreenLayoutProps) {
  const { isStoopyNav } = useNavLayout();
  const { overlay } = useOverlay();
  const insets = useSafeAreaInsets();
  // Overlays are already inset above the Stoopy bar — only pad the main tab content.
  const bottomPad =
    isStoopyNav && !overlay ? STOOPY_BAR_HEIGHT + Math.max(insets.bottom, 8) : 0;

  return (
    <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingBottom: bottomPad }}>
      <AppNavbar showBack={showBack} onBack={onBack} />
      <View className="flex-1">{children}</View>
    </View>
  );
}
