import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { ComponentProps } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import ScreenLayout from '../../components/layout/ScreenLayout';
import type { TabParamList } from '../../navigation/TabNavigator';
import { colors } from '../../theme/colors';

type HomeLink = {
  tab: keyof TabParamList;
  label: string;
  description: string;
  icon: ComponentProps<typeof Ionicons>['name'];
};

const HOME_LINKS: HomeLink[] = [
  {
    tab: 'ShopTab',
    label: 'Shop',
    description: 'Browse curated finds and secondhand treasures.',
    icon: 'bag-outline',
  },
  {
    tab: 'EventsTab',
    label: 'Events',
    description: 'See what is happening around the club.',
    icon: 'calendar-outline',
  },
  {
    tab: 'ResourcesTab',
    label: 'Resources',
    description: 'Guides, tips, and community knowledge.',
    icon: 'book-outline',
  },
  {
    tab: 'GetInvolvedTab',
    label: 'Get Involved',
    description: 'Volunteer, partner, or join the movement.',
    icon: 'people-outline',
  },
];

type TabNavigation = BottomTabNavigationProp<TabParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<TabNavigation>();

  return (
    <ScreenLayout>
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: colors.cream }}
        contentContainerClassName="px-4 pb-10 pt-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center">
          <Image
            source={require('../../../assets/stoopingclublogo.png')}
            className="h-24 w-56"
            resizeMode="contain"
            accessibilityLabel="Stooping Club"
          />
          <Text
            className="mt-4 text-center text-2xl text-brand"
            style={{ fontFamily: 'Georgia', color: colors.brand }}
          >
            Welcome to Stooping Club
          </Text>
          <Text className="mt-2 max-w-sm text-center text-sm leading-5 text-gray-600">
            Berkeley&apos;s community for finding, sharing, and giving furniture a second life.
          </Text>
        </View>

        <View className="mt-8 gap-3">
          {HOME_LINKS.map((link) => (
            <Pressable
              key={link.tab}
              className="flex-row items-center rounded-2xl border border-gray-100 bg-white p-4"
              onPress={() => navigation.navigate(link.tab)}
            >
              <View
                className="h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: colors.cardActive }}
              >
                <Ionicons name={link.icon} size={22} color={colors.brand} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold text-gray-900">{link.label}</Text>
                <Text className="mt-0.5 text-sm text-gray-500">{link.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
