import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, ScrollView, Text, View } from 'react-native';

import ScreenLayout from '../../components/layout/ScreenLayout';
import { GET_INVOLVED_SECTIONS } from '../../data/getInvolvedContent';
import { useTheme } from '../../context/ThemeContext';
import type { InvolvedStackParamList } from '../../navigation/stacks/InvolvedStack';
import type { ThemeColors } from '../../theme/colors';

const cardShadow = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
} as const;

type InvolvedNavigation = NativeStackNavigationProp<InvolvedStackParamList, 'GetInvolved'>;

type InvolvedCardProps = {
  title: string;
  label: string;
  paragraphs: readonly string[];
  buttonLabel: string;
  onButtonPress: () => void;
  colors: ThemeColors;
};

function InvolvedCard({
  title,
  label,
  paragraphs,
  buttonLabel,
  onButtonPress,
  colors,
}: InvolvedCardProps) {
  return (
    <View
      className="rounded-3xl border px-6 py-7"
      style={{
        borderColor: colors.border,
        backgroundColor: colors.background,
        ...cardShadow,
      }}
    >
      <Text
        className="text-xl leading-8"
        style={{ fontFamily: 'Georgia', color: colors.brandDark }}
      >
        {title}
      </Text>

      <Text className="mt-2 text-sm font-medium" style={{ color: colors.brand }}>
        {label}
      </Text>

      <View className="mt-5 gap-4">
        {paragraphs.map((paragraph, index) => (
          <Text
            key={`${title}-${index}`}
            className="text-base leading-6"
            style={{ color: colors.textMuted }}
          >
            {paragraph}
          </Text>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={buttonLabel}
        className="mt-7 self-center rounded-full px-8 py-3.5"
        style={{ backgroundColor: colors.brandDark }}
        onPress={onButtonPress}
      >
        <Text className="text-sm font-semibold text-white">{buttonLabel}</Text>
      </Pressable>
    </View>
  );
}

export default function GetInvolvedScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<InvolvedNavigation>();

  async function openStopWaste() {
    const section = GET_INVOLVED_SECTIONS.find((item) => item.id === 'stopwaste');
    if (section?.url) {
      await WebBrowser.openBrowserAsync(section.url);
    }
  }

  function openBranchApplication() {
    navigation.navigate('BranchDirectorApplication');
  }

  const buttonHandlers: Record<string, () => void> = {
    stopwaste: () => void openStopWaste(),
    branch: openBranchApplication,
  };

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
          Get Involved
        </Text>

        <View className="mt-8 gap-6">
          {GET_INVOLVED_SECTIONS.map((section) => (
            <InvolvedCard
              key={section.id}
              title={section.title}
              label={section.label}
              paragraphs={section.paragraphs}
              buttonLabel={section.buttonLabel}
              onButtonPress={buttonHandlers[section.id]}
              colors={colors}
            />
          ))}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
