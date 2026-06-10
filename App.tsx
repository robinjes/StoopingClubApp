import './global.css';

import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useLayoutEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SplashView from './src/components/layout/SplashView';
import AppNavigator from './src/navigation/AppNavigator';
import { rootNavigationRef } from './src/navigation/rootNavigation';
import { CartProvider } from './src/context/CartContext';
import { colors } from './src/theme/colors';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.cream,
    card: colors.background,
  },
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useLayoutEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        {showSplash ? (
          <SplashView onFinish={() => setShowSplash(false)} />
        ) : (
          <CartProvider>
            <NavigationContainer ref={rootNavigationRef} theme={navigationTheme}>
              <AppNavigator />
              <StatusBar style="auto" />
            </NavigationContainer>
          </CartProvider>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
});
