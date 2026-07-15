import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import StoopyGuide from '../components/navigation/StoopyGuide';
import FlyToCartOverlay from '../components/feedback/FlyToCartOverlay';
import { useFlyToCart } from '../context/FlyToCartContext';
import { useNavLayout } from '../context/NavLayoutContext';
import { useOverlay } from '../context/OverlayContext';
import { useTheme } from '../context/ThemeContext';
import ContactScreen from '../screens/shared/ContactScreen';
import DonateScreen from '../screens/shared/DonateScreen';
import { STOOPY_BAR_HEIGHT, TAB_BAR_HEIGHT } from './constants';
import { useNavigationTheme } from './navigationTheme';
import AboutStack from './stacks/AboutStack';
import AccountStack from './stacks/AccountStack';
import CartStack from './stacks/CartStack';
import InvolvedStack from './stacks/InvolvedStack';
import TabNavigator from './TabNavigator';

export default function AppShell() {
  const { overlay } = useOverlay();
  const { colors } = useTheme();
  const { isStoopyNav, isTabNav } = useNavLayout();
  const { cancelFly } = useFlyToCart();
  const navigationTheme = useNavigationTheme();
  const insets = useSafeAreaInsets();
  const overlayBottom = isTabNav
    ? TAB_BAR_HEIGHT + insets.bottom
    : isStoopyNav
      ? STOOPY_BAR_HEIGHT + Math.max(insets.bottom, 8)
      : 0;

  // Clear any stuck fly-to-cart image when leaving shop content / opening overlays.
  useEffect(() => {
    cancelFly();
  }, [cancelFly, overlay, isTabNav, isStoopyNav]);

  return (
    <View style={styles.container}>
      <TabNavigator />

      {overlay ? (
        <View
          style={[
            styles.overlay,
            { bottom: overlayBottom, backgroundColor: colors.background, zIndex: 17 },
          ]}
        >
          {overlay === 'cart' ? (
            <NavigationIndependentTree>
              <NavigationContainer theme={navigationTheme}>
                <CartStack />
              </NavigationContainer>
            </NavigationIndependentTree>
          ) : null}
          {overlay === 'donate' ? <DonateScreen /> : null}
          {overlay === 'contact' ? <ContactScreen /> : null}
          {isStoopyNav && overlay === 'about' ? (
            <NavigationIndependentTree>
              <NavigationContainer theme={navigationTheme}>
                <AboutStack />
              </NavigationContainer>
            </NavigationIndependentTree>
          ) : null}
          {isStoopyNav && overlay === 'involved' ? (
            <NavigationIndependentTree>
              <NavigationContainer theme={navigationTheme}>
                <InvolvedStack />
              </NavigationContainer>
            </NavigationIndependentTree>
          ) : null}
          {overlay === 'account' ? (
            <NavigationIndependentTree>
              <NavigationContainer theme={navigationTheme}>
                <AccountStack />
              </NavigationContainer>
            </NavigationIndependentTree>
          ) : null}
        </View>
      ) : null}

      {isStoopyNav ? <StoopyGuide /> : null}
      <FlyToCartOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
