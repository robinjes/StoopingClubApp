import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams } from '@react-navigation/native';

import EmptyTabScreen from '../screens/shared/EmptyTabScreen';
import { useOverlay } from '../context/OverlayContext';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../hooks/useWishlist';
import ScrollableTabBar from './ScrollableTabBar';
import AboutStack from './stacks/AboutStack';
import HomeStack, { type HomeStackParamList } from './stacks/HomeStack';
import InvolvedStack from './stacks/InvolvedStack';
import ShopStack, { type ShopStackParamList } from './stacks/ShopStack';
import WishlistStack from './stacks/WishlistStack';

export type TabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList> | undefined;
  ShopTab: NavigatorScreenParams<ShopStackParamList> | undefined;
  WishlistTab: undefined;
  DonateTab: undefined;
  AboutTab: undefined;
  GetInvolvedTab: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  const { closeOverlay, openOverlay } = useOverlay();
  const { colors } = useTheme();
  const { productIds } = useWishlist();

  return (
    <Tab.Navigator
      tabBar={(props) => <ScrollableTabBar {...props} />}
      screenListeners={({ route }) => ({
        tabPress: () => {
          if (route.name === 'DonateTab') {
            return;
          }
          closeOverlay();
        },
      })}
      screenOptions={{
        sceneStyle: { backgroundColor: colors.cream },
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Home' }} />
      <Tab.Screen name="ShopTab" component={ShopStack} options={{ title: 'Shop' }} />
      <Tab.Screen
        name="WishlistTab"
        component={WishlistStack}
        options={{
          title: 'Wishlist',
          tabBarBadge: productIds.length > 0 ? productIds.length : undefined,
        }}
      />
      <Tab.Screen
        name="DonateTab"
        component={EmptyTabScreen}
        options={{ title: 'Donate' }}
        listeners={{
          tabPress: (event) => {
            event.preventDefault();
            openOverlay('donate');
          },
        }}
      />
      <Tab.Screen name="AboutTab" component={AboutStack} options={{ title: 'About Us' }} />
      <Tab.Screen
        name="GetInvolvedTab"
        component={InvolvedStack}
        options={{ title: 'Get Involved' }}
      />
    </Tab.Navigator>
  );
}
