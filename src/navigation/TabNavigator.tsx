import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams } from '@react-navigation/native';

import EmptyTabScreen from '../screens/shared/EmptyTabScreen';
import { useNavLayout } from '../context/NavLayoutContext';
import { useOverlay } from '../context/OverlayContext';
import { useTheme } from '../context/ThemeContext';
import ScrollableTabBar from './ScrollableTabBar';
import AboutStack from './stacks/AboutStack';
import InvolvedStack from './stacks/InvolvedStack';
import ShopStack, { type ShopStackParamList } from './stacks/ShopStack';

export type TabParamList = {
  ShopTab: NavigatorScreenParams<ShopStackParamList> | undefined;
  DonateTab: undefined;
  AboutTab: undefined;
  GetInvolvedTab: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  const { closeOverlay, openOverlay } = useOverlay();
  const { colors } = useTheme();
  const { isTabNav } = useNavLayout();

  return (
    <Tab.Navigator
      initialRouteName="ShopTab"
      tabBar={isTabNav ? (props) => <ScrollableTabBar {...props} /> : () => null}
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
      <Tab.Screen name="ShopTab" component={ShopStack} options={{ title: 'Shop' }} />
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
