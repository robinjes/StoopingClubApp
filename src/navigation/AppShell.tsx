import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOverlay } from '../context/OverlayContext';
import ContactScreen from '../screens/shared/ContactScreen';
import DonateScreen from '../screens/shared/DonateScreen';
import CartStack from './stacks/CartStack';
import TabNavigator from './TabNavigator';

const TAB_BAR_HEIGHT = 56;

export default function AppShell() {
  const { overlay } = useOverlay();
  const insets = useSafeAreaInsets();
  const tabBarOffset = TAB_BAR_HEIGHT + insets.bottom;

  return (
    <View style={styles.container}>
      <TabNavigator />

      {overlay ? (
        <View style={[styles.overlay, { bottom: tabBarOffset }]}>
          {overlay === 'cart' ? (
            <NavigationIndependentTree>
              <NavigationContainer>
                <CartStack />
              </NavigationContainer>
            </NavigationIndependentTree>
          ) : null}
          {overlay === 'donate' ? <DonateScreen /> : null}
          {overlay === 'contact' ? <ContactScreen /> : null}
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
    backgroundColor: '#FFFFFF',
  },
});
