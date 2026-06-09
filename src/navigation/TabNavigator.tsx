import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { ComponentProps } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOverlay } from '../context/OverlayContext';
import { colors } from '../theme/colors';
import EventsStack from './stacks/EventsStack';
import HomeStack from './stacks/HomeStack';
import InvolvedStack from './stacks/InvolvedStack';
import ResourcesStack from './stacks/ResourcesStack';
import ShopStack from './stacks/ShopStack';

export type TabParamList = {
  HomeTab: undefined;
  ShopTab: undefined;
  EventsTab: undefined;
  ResourcesTab: undefined;
  GetInvolvedTab: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const ACTIVE_TAB_COLOR = '#3B6D11';
const TAB_BAR_HEIGHT = 56;

type IoniconName = ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IoniconName) {
  return ({ color, size }: { color: string; size: number }) => (
    <Ionicons name={name} size={size} color={color} />
  );
}

export default function TabNavigator() {
  const insets = useSafeAreaInsets();
  const { closeOverlay } = useOverlay();

  return (
    <Tab.Navigator
      screenListeners={{
        tabPress: () => {
          closeOverlay();
        },
      }}
      screenOptions={{
        sceneStyle: { backgroundColor: colors.cream },
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_TAB_COLOR,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ title: 'Home', tabBarIcon: tabIcon('home-outline') }}
      />
      <Tab.Screen
        name="ShopTab"
        component={ShopStack}
        options={{ title: 'Shop', tabBarIcon: tabIcon('bag-outline') }}
      />
      <Tab.Screen
        name="EventsTab"
        component={EventsStack}
        options={{ title: 'Events', tabBarIcon: tabIcon('calendar-outline') }}
      />
      <Tab.Screen
        name="ResourcesTab"
        component={ResourcesStack}
        options={{ title: 'Resources', tabBarIcon: tabIcon('book-outline') }}
      />
      <Tab.Screen
        name="GetInvolvedTab"
        component={InvolvedStack}
        options={{ title: 'Get Involved', tabBarIcon: tabIcon('people-outline') }}
      />
    </Tab.Navigator>
  );
}
