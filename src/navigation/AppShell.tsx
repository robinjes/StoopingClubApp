import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOverlay } from '../context/OverlayContext';
import { useTheme } from '../context/ThemeContext';
import ContactScreen from '../screens/shared/ContactScreen';
import DonateScreen from '../screens/shared/DonateScreen';
import { TAB_BAR_HEIGHT } from './constants';
import AccountStack from './stacks/AccountStack';
import CartStack from './stacks/CartStack';
import TabNavigator from './TabNavigator';

export default function AppShell() {
  const { overlay } = useOverlay();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarOffset = TAB_BAR_HEIGHT + insets.bottom;

  return (
    <View style={styles.container}>
      <TabNavigator />

      {overlay ? (
        <View style={[styles.overlay, { bottom: tabBarOffset, backgroundColor: colors.background }]}>
          {overlay === 'cart' ? (
            <NavigationIndependentTree>
              <NavigationContainer>
                <CartStack />
              </NavigationContainer>
            </NavigationIndependentTree>
          ) : null}
          {overlay === 'donate' ? <DonateScreen /> : null}
          {overlay === 'contact' ? <ContactScreen /> : null}
          {overlay === 'account' ? (
            <NavigationIndependentTree>
              <NavigationContainer>
                <AccountStack />
              </NavigationContainer>
            </NavigationIndependentTree>
          ) : null}
        </View>
      ) : null}
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
