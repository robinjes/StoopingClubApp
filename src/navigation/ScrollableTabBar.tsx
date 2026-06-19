import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { ComponentProps } from 'react';
import { useEffect, useRef } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOverlay } from '../context/OverlayContext';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../theme/colors';
import { PRIMARY_TAB_NAMES } from './constants';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { outline: IoniconName; filled: IoniconName }> = {
  HomeTab: { outline: 'home-outline', filled: 'home' },
  ShopTab: { outline: 'bag-outline', filled: 'bag' },
  WishlistTab: { outline: 'heart-outline', filled: 'heart' },
  DonateTab: { outline: 'gift-outline', filled: 'gift' },
  AboutTab: { outline: 'information-circle-outline', filled: 'information-circle' },
  GetInvolvedTab: { outline: 'people-outline', filled: 'people' },
};

type TabButtonProps = {
  routeName: string;
  label: string;
  isFocused: boolean;
  isPrimary: boolean;
  colors: ThemeColors;
  badge?: string | number;
  accessibilityLabel?: string;
  onPress: () => void;
  onLongPress: () => void;
  flex?: number;
};

function TabButton({
  routeName,
  label,
  isFocused,
  isPrimary,
  colors,
  badge,
  accessibilityLabel,
  onPress,
  onLongPress,
  flex,
}: TabButtonProps) {
  const icons = TAB_ICONS[routeName];
  const iconName = isFocused && icons ? icons.filled : icons?.outline ?? 'ellipse-outline';
  const iconSize = isPrimary ? (isFocused ? 32 : 28) : isFocused ? 24 : 22;
  const iconColor = isFocused ? colors.brand : colors.textMuted;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      onLongPress={onLongPress}
      style={{
        flex: flex ?? undefined,
        minWidth: isPrimary ? undefined : 80,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: isPrimary ? 8 : 12,
        paddingVertical: 8,
        borderRadius: 18,
        backgroundColor:
          isFocused && isPrimary
            ? colors.cardActive
            : isPrimary
              ? colors.surfaceMuted
              : isFocused
                ? colors.cardActive
                : 'transparent',
        borderWidth: isPrimary ? 1 : 0,
        borderColor: isFocused && isPrimary ? colors.brand : colors.border,
      }}
    >
      <View>
        <Ionicons name={iconName} size={iconSize} color={iconColor} />
        {badge != null ? (
          <View
            style={{
              position: 'absolute',
              top: -6,
              right: -10,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 4,
              backgroundColor: colors.brand,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>
              {typeof badge === 'number' && badge > 9 ? '9+' : String(badge)}
            </Text>
          </View>
        ) : null}
      </View>

      <Text
        numberOfLines={1}
        style={{
          marginTop: 5,
          fontSize: isPrimary ? 12 : 10,
          fontWeight: isFocused ? '700' : isPrimary ? '600' : '500',
          color: isFocused ? colors.brand : isPrimary ? colors.text : colors.textMuted,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

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
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);

  const isDonateOverlayOpen = overlay === 'donate';
  const primaryRoutes = state.routes.filter((route) => PRIMARY_TAB_NAMES.has(route.name));
  const secondaryRoutes = state.routes.filter((route) => !PRIMARY_TAB_NAMES.has(route.name));
  const activeRoute = state.routes[state.index];
  const isSecondaryActive =
    isDonateOverlayOpen ||
    (activeRoute != null && !PRIMARY_TAB_NAMES.has(activeRoute.name));

  useEffect(() => {
    if (isSecondaryActive) {
      scrollRef.current?.scrollTo({ x: screenWidth, animated: true });
      return;
    }

    scrollRef.current?.scrollTo({ x: 0, animated: true });
  }, [isSecondaryActive, screenWidth, state.index]);

  return (
    <View
      style={{
        backgroundColor: colors.background,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        paddingBottom: Platform.OS === 'ios' ? insets.bottom : 10,
      }}
    >
      <View style={{ position: 'relative' }}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces
          decelerationRate="fast"
          contentContainerStyle={{ alignItems: 'flex-end' }}
        >
          <View
            style={{
              width: screenWidth,
              flexDirection: 'row',
              paddingTop: 10,
              paddingHorizontal: 8,
              gap: 4,
            }}
          >
            {primaryRoutes.map((route) => {
              const index = state.routes.findIndex((item) => item.key === route.key);
              const { options } = descriptors[route.key];
              const isFocused = isRouteFocused(
                route.name,
                index,
                state.index,
                isDonateOverlayOpen,
              );
              const { onPress, onLongPress } = createTabHandlers(route, isFocused, navigation);

              return (
                <TabButton
                  key={route.key}
                  routeName={route.name}
                  label={options.title ?? route.name}
                  isFocused={isFocused}
                  isPrimary
                  colors={colors}
                  badge={options.tabBarBadge}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  flex={1}
                />
              );
            })}
          </View>

          {secondaryRoutes.length > 0 ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                paddingTop: 10,
                paddingRight: 12,
                paddingLeft: 4,
                gap: 4,
              }}
            >
              {secondaryRoutes.map((route) => {
                const index = state.routes.findIndex((item) => item.key === route.key);
                const { options } = descriptors[route.key];
                const isFocused = isRouteFocused(
                  route.name,
                  index,
                  state.index,
                  isDonateOverlayOpen,
                );
                const { onPress, onLongPress } = createTabHandlers(route, isFocused, navigation);

                return (
                  <TabButton
                    key={route.key}
                    routeName={route.name}
                    label={options.title ?? route.name}
                    isFocused={isFocused}
                    isPrimary={false}
                    colors={colors}
                    accessibilityLabel={options.tabBarAccessibilityLabel}
                    onPress={onPress}
                    onLongPress={onLongPress}
                  />
                );
              })}
            </View>
          ) : null}
        </ScrollView>

        {secondaryRoutes.length > 0 && !isSecondaryActive ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              right: 6,
              top: 28,
            }}
          >
            <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
          </View>
        ) : null}
      </View>
    </View>
  );
}
