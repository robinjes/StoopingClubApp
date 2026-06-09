import type { ReactNode } from 'react';
import { View } from 'react-native';

import AppNavbar from './AppNavbar';

type ScreenLayoutProps = {
  children: ReactNode;
  showBack?: boolean;
};

export default function ScreenLayout({ children, showBack = false }: ScreenLayoutProps) {
  return (
    <View className="flex-1 bg-white">
      <AppNavbar showBack={showBack} />
      <View className="flex-1">{children}</View>
    </View>
  );
}
