import { ScrollView, Text, View } from 'react-native';

import ScreenLayout from '../../components/layout/ScreenLayout';
import {
  ABOUT_DESCRIPTION,
  ABOUT_FOOTER,
  ABOUT_MILESTONES,
  ABOUT_MISSION,
  ABOUT_STORY_SUBTITLE,
  ABOUT_TAGLINE,
  ABOUT_VISION,
} from '../../data/aboutContent';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../theme/colors';

function SectionCard({
  title,
  body,
  colors,
}: {
  title: string;
  body: string;
  colors: ThemeColors;
}) {
  return (
    <View
      className="rounded-3xl border px-5 py-6"
      style={{ borderColor: colors.border, backgroundColor: colors.background }}
    >
      <Text
        className="text-lg font-semibold"
        style={{ fontFamily: 'Georgia', color: colors.brandDark }}
      >
        {title}
      </Text>
      <Text className="mt-3 text-base leading-6" style={{ color: colors.textMuted }}>
        {body}
      </Text>
    </View>
  );
}

export default function AboutScreen() {
  const { colors } = useTheme();

  return (
    <ScreenLayout>
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: colors.cream }}
        contentContainerClassName="px-4 pb-10 pt-6"
        showsVerticalScrollIndicator={false}
      >
        <Text
          className="text-3xl leading-10"
          style={{ fontFamily: 'Georgia', color: colors.brandDark }}
        >
          About Us
        </Text>

        <View
          className="mt-6 rounded-3xl px-6 py-8"
          style={{ backgroundColor: colors.brandDark }}
        >
          <Text
            className="text-center text-2xl leading-9 text-white"
            style={{ fontFamily: 'Georgia' }}
          >
            {ABOUT_TAGLINE}
          </Text>
        </View>

        <Text className="mt-6 text-base leading-6" style={{ color: colors.text }}>
          {ABOUT_DESCRIPTION}
        </Text>

        <View className="mt-6 gap-4">
          <SectionCard title="Our Vision" body={ABOUT_VISION} colors={colors} />
          <SectionCard title="Our Mission" body={ABOUT_MISSION} colors={colors} />
        </View>

        <View
          className="mt-10 rounded-2xl px-4 py-3"
          style={{ backgroundColor: colors.brandDark }}
        >
          <Text
            className="text-center text-lg text-white"
            style={{ fontFamily: 'Georgia' }}
          >
            Our Story
          </Text>
        </View>

        <Text className="mt-3 text-center text-sm" style={{ color: colors.textMuted }}>
          {ABOUT_STORY_SUBTITLE}
        </Text>

        <View className="mt-5">
          {ABOUT_MILESTONES.map((milestone) => (
            <View
              key={milestone.id}
              className="mb-4 rounded-3xl border px-5 py-5"
              style={{
                borderColor: colors.border,
                backgroundColor: milestone.id === 'berkeley' ? colors.cardActive : colors.background,
              }}
            >
              <Text className="text-xs font-semibold tracking-wide" style={{ color: colors.brand }}>
                {milestone.date}
              </Text>
              <Text
                className="mt-1 text-base font-semibold"
                style={{ fontFamily: 'Georgia', color: colors.text }}
              >
                {milestone.title}
              </Text>
              <Text className="mt-2 text-sm leading-5" style={{ color: colors.textMuted }}>
                {milestone.description}
              </Text>
            </View>
          ))}
        </View>

        <Text className="mt-4 text-center text-xs leading-5" style={{ color: colors.textMuted }}>
          {ABOUT_FOOTER}
        </Text>
      </ScrollView>
    </ScreenLayout>
  );
}
