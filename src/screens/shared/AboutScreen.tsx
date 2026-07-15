import type { ImageSourcePropType } from 'react-native';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenLayout from '../../components/layout/ScreenLayout';
import {
  ABOUT_DESCRIPTION,
  ABOUT_FOOTER,
  ABOUT_MILESTONES,
  ABOUT_MISSION,
  ABOUT_STORY_SUBTITLE,
  ABOUT_VISION,
  type AboutMilestone,
} from '../../data/aboutContent';
import { ABOUT_MILESTONE_IMAGES } from '../../data/aboutMilestoneImages';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../theme/colors';

const TIMELINE_DATE_COLOR = '#7A9B6D';
const TIMELINE_LINE_COLOR = '#E5E7EB';
const VISION_MISSION_BG = '#F5F5F5';

function MilestoneCard({
  milestone,
  image,
  colors,
}: {
  milestone: AboutMilestone;
  image?: ImageSourcePropType;
  colors: ThemeColors;
}) {
  return (
    <View
      style={[
        styles.milestoneCard,
        {
          backgroundColor: colors.background,
          shadowOpacity: colors.background === '#FFFFFF' ? 0.08 : 0.2,
        },
      ]}
    >
      {image ? (
        <Image
          source={image}
          style={styles.milestoneImage}
          resizeMode="cover"
          accessibilityLabel={milestone.title}
        />
      ) : null}
      <View style={styles.milestoneBody}>
        <Text style={[styles.milestoneTitle, { color: colors.text }]}>{milestone.title}</Text>
        <Text style={[styles.milestoneDescription, { color: colors.textMuted }]}>
          {milestone.description}
        </Text>
      </View>
    </View>
  );
}

function VisionMissionCard({
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
      style={[
        styles.visionMissionCard,
        { backgroundColor: colors.background === '#FFFFFF' ? VISION_MISSION_BG : colors.surfaceMuted },
      ]}
    >
      <Text style={[styles.visionMissionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.visionMissionBody, { color: colors.textMuted }]}>{body}</Text>
    </View>
  );
}

function TimelineItem({
  milestone,
  index,
  isLast,
  colors,
}: {
  milestone: AboutMilestone;
  index: number;
  isLast: boolean;
  colors: ThemeColors;
}) {
  const isLeft = index % 2 === 0;
  const image = ABOUT_MILESTONE_IMAGES[milestone.id];

  return (
    <View style={styles.timelineItem}>
      <Text style={styles.timelineDate}>{milestone.date.toUpperCase()}</Text>

      <View style={styles.timelineRow}>
        <View style={[styles.timelineSide, isLeft ? styles.timelineSideActive : null]}>
          {isLeft ? <MilestoneCard milestone={milestone} image={image} colors={colors} /> : null}
        </View>

        <View style={styles.timelineSpine}>
          <View style={[styles.timelineDot, { backgroundColor: colors.brandDark }]} />
          {!isLast ? <View style={styles.timelineLine} /> : null}
        </View>

        <View style={[styles.timelineSide, !isLeft ? styles.timelineSideActive : null]}>
          {!isLeft ? <MilestoneCard milestone={milestone} image={image} colors={colors} /> : null}
        </View>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  const { colors } = useTheme();

  return (
    <ScreenLayout>
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
        contentContainerClassName="pb-12 pt-8"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageTitle, { color: colors.text }]}>About Us</Text>

        <Text style={[styles.intro, { color: colors.textMuted }]}>{ABOUT_DESCRIPTION}</Text>

        <View style={styles.visionMissionRow}>
          <VisionMissionCard title="Our Vision" body={ABOUT_VISION} colors={colors} />
          <VisionMissionCard title="Our Mission" body={ABOUT_MISSION} colors={colors} />
        </View>

        <View style={styles.storyHeader}>
          <Text style={[styles.storyTitle, { color: colors.text }]}>Our Story</Text>
          <Text style={[styles.storySubtitle, { color: colors.textMuted }]}>{ABOUT_STORY_SUBTITLE}</Text>
        </View>

        <View style={styles.timeline}>
          {ABOUT_MILESTONES.map((milestone, index) => (
            <TimelineItem
              key={milestone.id}
              milestone={milestone}
              index={index}
              isLast={index === ABOUT_MILESTONES.length - 1}
              colors={colors}
            />
          ))}
        </View>

        <Text style={[styles.footer, { color: colors.textMuted }]}>{ABOUT_FOOTER}</Text>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    textAlign: 'center',
    fontFamily: 'Georgia',
    fontSize: 34,
    lineHeight: 42,
    paddingHorizontal: 20,
  },
  intro: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 24,
    paddingHorizontal: 24,
  },
  visionMissionRow: {
    marginTop: 28,
    paddingHorizontal: 16,
    gap: 12,
  },
  visionMissionCard: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  visionMissionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  visionMissionBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
  },
  storyHeader: {
    marginTop: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  storyTitle: {
    fontFamily: 'Georgia',
    fontSize: 26,
    lineHeight: 32,
  },
  storySubtitle: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  timeline: {
    marginTop: 28,
    paddingHorizontal: 8,
  },
  timelineItem: {
    marginBottom: 8,
  },
  timelineDate: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: TIMELINE_DATE_COLOR,
    marginBottom: 12,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineSide: {
    flex: 1,
    minHeight: 1,
  },
  timelineSideActive: {
    paddingHorizontal: 4,
  },
  timelineSpine: {
    width: 20,
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 12,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 40,
    backgroundColor: TIMELINE_LINE_COLOR,
    marginTop: 4,
  },
  milestoneCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  milestoneImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#F3F4F6',
  },
  milestoneBody: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  milestoneDescription: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 17,
    paddingHorizontal: 24,
  },
});
