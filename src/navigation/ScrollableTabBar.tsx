import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { ComponentProps } from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TabBarIcon from '../components/feedback/TabBarIcon';
import AnimatedPressable from '../components/feedback/AnimatedPressable';
import { useOverlay } from '../context/OverlayContext';
import { useTheme } from '../context/ThemeContext';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type TabVisual = {
  outline: IoniconName;
  filled: IoniconName;
  activeColor: string;
  inactiveColor: string;
};

const TAB_VISUALS: Record<string, TabVisual> = {
  ShopTab: {
    outline: 'bag-outline',
    filled: 'bag',
    activeColor: '#3B6D11',
    inactiveColor: '#84A867',
  },
  DonateTab: {
    outline: 'gift-outline',
    filled: 'gift',
    activeColor: '#FF4B4B',
    inactiveColor: '#FF8A8A',
  },
  AboutTab: {
    outline: 'information-circle-outline',
    filled: 'information-circle',
    activeColor: '#1CB0F6',
    inactiveColor: '#7DD3FC',
  },
  GetInvolvedTab: {
    outline: 'people-outline',
    filled: 'people',
    activeColor: '#CE82FF',
    inactiveColor: '#E4B7FF',
  },
};

const ACTIVE_TAB_BG = '#DDF4FF';

function createTabHandlers(
  route: BottomTabBarProps['state']['routes'][number],
  isFocused: boolean,
  navigation: BottomTabBarProps['navigation'],
) {
  const onPress = () => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

  const onLongPress = () => {
    navigation.emit({
      type: 'tabLongPress',
      target: route.key,
    });
  };

  return { onPress, onLongPress };
}

function isRouteFocused(
  routeName: string,
  tabIndex: number,
  activeTabIndex: number,
  isDonateOverlayOpen: boolean,
): boolean {
  if (isDonateOverlayOpen) {
    return routeName === 'DonateTab';
  }

  return activeTabIndex === tabIndex;
}

export default function ScrollableTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { overlay } = useOverlay();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const isDonateOverlayOpen = overlay === 'donate';
  const activeTabBackground = isDark ? colors.cardActive : ACTIVE_TAB_BG;

  return (
    <View
      style={{
        backgroundColor: colors.background,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
        paddingTop: 8,
        paddingHorizontal: 8,
      }}
    >
      <View className="flex-row items-center justify-around">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = isRouteFocused(route.name, index, state.index, isDonateOverlayOpen);
          const { onPress, onLongPress } = createTabHandlers(route, isFocused, navigation);
          const visual = TAB_VISUALS[route.name];
          const iconName =
            isFocused && visual ? visual.filled : visual?.outline ?? 'ellipse-outline';
          const iconColor = isFocused
            ? visual?.activeColor ?? '#3B6D11'
            : visual?.inactiveColor ?? '#AFAFAF';

          return (
            <AnimatedPressable
              key={route.key}
              haptic="selection"
              pressedScale={0.92}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? options.title ?? route.name}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: isFocused ? activeTabBackground : 'transparent',
                borderWidth: isFocused ? 2 : 0,
                borderColor: isFocused ? (isDark ? colors.brand : '#84D8FF') : 'transparent',
              }}
            >
              <TabBarIcon name={iconName} color={iconColor} isFocused={isFocused} />
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}
