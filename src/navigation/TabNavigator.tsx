import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { ComponentProps } from 'react';

import EventsStack from './stacks/EventsStack';
import InvolvedStack from './stacks/InvolvedStack';
import ResourcesStack from './stacks/ResourcesStack';
import ShopStack from './stacks/ShopStack';

export type TabParamList = {
  ShopTab: undefined;
  EventsTab: undefined;
  ResourcesTab: undefined;
  GetInvolvedTab: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const ACTIVE_TAB_COLOR = '#3B6D11';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IoniconName) {
  return ({ color, size }: { color: string; size: number }) => (
    <Ionicons name={name} size={size} color={color} />
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_TAB_COLOR,
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
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
