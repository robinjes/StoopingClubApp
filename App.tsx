import './global.css';

import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useLayoutEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SplashView from './src/components/layout/SplashView';
import { CartProvider } from './src/context/CartContext';
import { CustomerProvider } from './src/context/CustomerContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { usePickupReminders } from './src/hooks/usePickupReminders';
import AppNavigator from './src/navigation/AppNavigator';
import { rootNavigationRef } from './src/navigation/rootNavigation';

function AppContent() {
  const { colors, isDark } = useTheme();
  usePickupReminders(true);

  const navigationTheme = {
    ...DefaultTheme,
    dark: isDark,
    colors: {
      ...DefaultTheme.colors,
      background: colors.cream,
      card: colors.background,
      text: colors.text,
      border: colors.border,
      primary: colors.brand,
    },
  };

  return (
    <CustomerProvider>
      <CartProvider>
        <NavigationContainer ref={rootNavigationRef} theme={navigationTheme}>
          <AppNavigator />
          <StatusBar style={isDark ? 'light' : 'dark'} />
        </NavigationContainer>
      </CartProvider>
    </CustomerProvider>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useLayoutEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedRoot showSplash={showSplash} onSplashFinish={() => setShowSplash(false)} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

type ThemedRootProps = {
  showSplash: boolean;
  onSplashFinish: () => void;
};

function ThemedRoot({ showSplash, onSplashFinish }: ThemedRootProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.cream }]}>
      {showSplash ? <SplashView onFinish={onSplashFinish} /> : <AppContent />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
