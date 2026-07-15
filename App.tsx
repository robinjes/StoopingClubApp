import './global.css';

import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useLayoutEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SplashView from './src/components/layout/SplashView';
import { CartProvider } from './src/context/CartContext';
import { CustomerProvider } from './src/context/CustomerContext';
import { FeedbackProvider } from './src/context/FeedbackContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { usePickupReminders } from './src/hooks/usePickupReminders';
import { useNotificationFeedback } from './src/hooks/useNotificationFeedback';
import AppNavigator from './src/navigation/AppNavigator';
import { useNavigationTheme } from './src/navigation/navigationTheme';
import { rootNavigationRef } from './src/navigation/rootNavigation';

function AppContent() {
  const { isDark } = useTheme();
  const navigationTheme = useNavigationTheme();
  usePickupReminders(true);
  useNotificationFeedback(true);

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
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <FeedbackProvider>
            <ThemedRoot showSplash={showSplash} onSplashFinish={() => setShowSplash(false)} />
          </FeedbackProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
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
