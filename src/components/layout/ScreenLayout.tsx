import type { ReactNode } from 'react';
import { View } from 'react-native';

import AppNavbar from './AppNavbar';

type ScreenLayoutProps = {
  children: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
};

export default function ScreenLayout({ children, showBack = false, onBack }: ScreenLayoutProps) {
  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <AppNavbar showBack={showBack} onBack={onBack} />
      <View className="flex-1">{children}</View>
    </View>
  );
}
