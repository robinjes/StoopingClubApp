import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CollectionsScreen from '../screens/CollectionsScreen';
import GridScreen from '../screens/GridScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import StrollScreen from '../screens/StrollScreen';
import {
  CollectionsStackParamList,
  GridStackParamList,
  RootTabParamList,
  StrollStackParamList,
} from './types';

const GridStack = createNativeStackNavigator<GridStackParamList>();
const CollectionsStack = createNativeStackNavigator<CollectionsStackParamList>();
const StrollStack = createNativeStackNavigator<StrollStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

function GridStackNavigator() {
  return (
    <GridStack.Navigator>
      <GridStack.Screen name="Grid" component={GridScreen} />
      <GridStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Product' }}
      />
    </GridStack.Navigator>
  );
}

function CollectionsStackNavigator() {
  return (
    <CollectionsStack.Navigator>
      <CollectionsStack.Screen name="Collections" component={CollectionsScreen} />
      <CollectionsStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Product' }}
      />
    </CollectionsStack.Navigator>
  );
}

function StrollStackNavigator() {
  return (
    <StrollStack.Navigator>
      <StrollStack.Screen name="Stroll" component={StrollScreen} />
      <StrollStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Product' }}
      />
    </StrollStack.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#111827',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === 'GridTab'
              ? 'grid-outline'
              : route.name === 'CollectionsTab'
                ? 'albums-outline'
                : 'walk-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="GridTab"
        component={GridStackNavigator}
        options={{ title: 'Grid' }}
      />
      <Tab.Screen
        name="CollectionsTab"
        component={CollectionsStackNavigator}
        options={{ title: 'Collections' }}
      />
      <Tab.Screen
        name="StrollTab"
        component={StrollStackNavigator}
        options={{ title: 'Stroll' }}
      />
    </Tab.Navigator>
  );
}
