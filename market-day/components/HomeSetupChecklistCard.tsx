import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  Check,
  ChevronDown,
  HandCoins,
  ImagePlus,
  PackagePlus,
  type LucideIcon,
} from 'lucide-react-native';

import { UiIcon } from '@/components/ui/UiIcon';
import { colors } from '@/constants/theme';
import { fonts, radii } from '@/constants/visual';
import {
  HOME_SETUP_HIDDEN_STRIP,
  buildHomeSetupTasks,
  homeSetupHeaderSubtext,
  homeSetupProgress,
  isHomeSetupRequiredComplete,
  type HomeSetupCompletions,
  type HomeSetupTask,
  type HomeSetupTaskId,
} from '@/lib/home-setup-checklist';

const PROGRESS_MS = 400;
const EXPAND_MS = 300;
const CHECK_MS = 200;
const EASE = Easing.out(Easing.cubic);

const TASK_ICONS: Record<HomeSetupTaskId, LucideIcon> = {
  inventory: PackagePlus,
  payment: HandCoins,
  logo: ImagePlus,
};

type HomeSetupChecklistCardProps = {
  completions: HomeSetupCompletions;
  onTaskPress: (taskId: HomeSetupTaskId) => void;
};

export function HomeSetupChecklistCard({
  completions,
  onTaskPress,
}: HomeSetupChecklistCardProps) {
  const reduceMotion = useReducedMotion();
  const requiredComplete = isHomeSetupRequiredComplete(completions);
  const canHide = requiredComplete;
  const [hidden, setHidden] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const progress = homeSetupProgress(completions);
  const fill = useSharedValue(progress);

  // Hide (strip) is only allowed after required is done; if that unlock goes away, leave strip mode.
  useEffect(() => {
    if (!canHide) setHidden(false);
  }, [canHide]);

  useEffect(() => {
    const duration = reduceMotion ? 0 : PROGRESS_MS;
    fill.value = withTiming(progress, { duration, easing: EASE });
  }, [fill, progress, reduceMotion]);

  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: fill.value }],
  }));

  const toggleExpanded = () => setExpanded((value) => !value);

  if (hidden && canHide) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={HOME_SETUP_HIDDEN_STRIP}
        onPress={() => {
          setHidden(false);
          setExpanded(true);
        }}
        style={({ pressed }) => [styles.strip, pressed && styles.pressed]}>
        <Text style={styles.stripText}>{HOME_SETUP_HIDDEN_STRIP}</Text>
      </Pressable>
    );
  }

  const tasks = buildHomeSetupTasks(completions);
  const requiredTask = tasks.find((task) => task.kind === 'required');
  const optionalTasks = tasks.filter((task) => task.kind === 'optional');
  const subtext = homeSetupHeaderSubtext(completions);
  const expandDuration = reduceMotion ? 0 : EXPAND_MS;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel="Get your shop ready"
          onPress={toggleExpanded}
          style={styles.headerMain}>
          <Text style={styles.title}>Get your shop ready</Text>
          <Text style={styles.subtext}>{subtext}</Text>
          <View
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
            style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, fillStyle]} />
          </View>
        </Pressable>

        <View style={styles.headerActions}>
          {canHide ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Hide setup checklist"
              hitSlop={10}
              onPress={(event) => {
                event.stopPropagation?.();
                setHidden(true);
              }}
              style={({ pressed }) => [styles.hideButton, pressed && styles.pressed]}>
              <Text style={styles.hideLabel}>Hide</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={expanded ? 'Collapse checklist' : 'Expand checklist'}
            hitSlop={8}
            onPress={toggleExpanded}
            style={({ pressed }) => [styles.chevronButton, pressed && styles.pressed]}>
            <AnimatedChevron expanded={expanded} reduceMotion={Boolean(reduceMotion)} />
          </Pressable>
        </View>
      </View>

      {expanded ? (
        <Animated.View
          entering={FadeIn.duration(expandDuration).easing(EASE)}
          exiting={FadeOut.duration(expandDuration).easing(EASE)}
          style={styles.body}>
          {requiredTask ? (
            <TaskRow task={requiredTask} onPress={() => onTaskPress(requiredTask.id)} />
          ) : null}

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>Optional — set up anytime</Text>
            <View style={styles.dividerLine} />
          </View>

          {optionalTasks.map((task, index) => (
            <TaskRow
              key={task.id}
              task={task}
              onPress={() => onTaskPress(task.id)}
              showDivider={index < optionalTasks.length - 1}
            />
          ))}
        </Animated.View>
      ) : null}
    </View>
  );
}

function AnimatedChevron({
  expanded,
  reduceMotion,
}: {
  expanded: boolean;
  reduceMotion: boolean;
}) {
  const rotation = useSharedValue(expanded ? 0 : 180);

  useEffect(() => {
    rotation.value = withTiming(expanded ? 0 : 180, {
      duration: reduceMotion ? 0 : EXPAND_MS,
      easing: EASE,
    });
  }, [expanded, reduceMotion, rotation]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={style}>
      <UiIcon icon={ChevronDown} size={18} color={colors.inkSoft} />
    </Animated.View>
  );
}

function TaskRow({
  task,
  onPress,
  showDivider = true,
}: {
  task: HomeSetupTask;
  onPress: () => void;
  showDivider?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const checkProgress = useSharedValue(task.complete ? 1 : 0);

  useEffect(() => {
    checkProgress.value = withTiming(task.complete ? 1 : 0, {
      duration: reduceMotion ? 0 : CHECK_MS,
      easing: EASE,
    });
  }, [checkProgress, reduceMotion, task.complete]);

  const checkFillStyle = useAnimatedStyle(() => ({
    opacity: checkProgress.value,
    transform: [{ scale: 0.7 + checkProgress.value * 0.3 }],
  }));

  const Icon = TASK_ICONS[task.id];
  const titleStyle = task.complete ? [styles.taskTitle, styles.taskTitleDone] : styles.taskTitle;

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ checked: task.complete }}
        accessibilityLabel={`${task.title}. ${task.subtitle}`}
        onPress={onPress}
        style={({ pressed }) => [styles.taskRow, pressed && styles.pressed]}>
        <View style={styles.taskIconWrap}>
          <UiIcon icon={Icon} size={20} color={colors.purple} />
        </View>

        <View style={styles.taskCopy}>
          <View style={styles.taskTitleRow}>
            <Text style={titleStyle}>{task.title}</Text>
            {task.kind === 'required' ? (
              <View style={[styles.tag, styles.requiredTag]}>
                <Text style={[styles.tagLabel, styles.requiredTagLabel]}>Required</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.taskSubtitle}>{task.subtitle}</Text>
        </View>

        <View
          style={[styles.checkbox, task.complete ? styles.checkboxDone : styles.checkboxTodo]}
          accessibilityElementsHidden
          importantForAccessibility="no">
          <Animated.View style={checkFillStyle}>
            <UiIcon icon={Check} size={14} color={colors.white} strokeWidth={3} />
          </Animated.View>
        </View>
      </Pressable>
      {showDivider ? <View style={styles.rowDivider} /> : null}
    </View>
  );
}

const REQUIRED_TAG_BG = '#F8E0EA';
const PROGRESS_TRACK = '#E8D9F8';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.cart,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    shadowColor: colors.ink,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  headerMain: {
    flex: 1,
    gap: 6,
    paddingBottom: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 2,
    paddingTop: 2,
  },
  title: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 18,
    color: colors.ink,
  },
  subtext: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.inkSoft,
  },
  progressTrack: {
    marginTop: 6,
    height: 8,
    borderRadius: 999,
    backgroundColor: PROGRESS_TRACK,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '100%',
    borderRadius: 999,
    backgroundColor: colors.purple,
    transformOrigin: 'left center',
  },
  hideButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
  },
  hideLabel: {
    fontFamily: fonts.body.bold,
    fontSize: 13,
    color: colors.purpleDark,
  },
  chevronButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingTop: 4,
    paddingBottom: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  dividerLabel: {
    fontFamily: fonts.body.bold,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  taskIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  taskTitle: {
    fontFamily: fonts.body.bold,
    fontSize: 15,
    color: colors.ink,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.inkSoft,
  },
  taskSubtitle: {
    fontFamily: fonts.body.regular,
    fontSize: 13,
    color: colors.inkSoft,
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  requiredTag: {
    backgroundColor: REQUIRED_TAG_BG,
  },
  tagLabel: {
    fontFamily: fonts.body.bold,
    fontSize: 10,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  requiredTagLabel: {
    color: colors.purpleDark,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxTodo: {
    borderWidth: 2,
    borderColor: PROGRESS_TRACK,
    backgroundColor: colors.white,
  },
  checkboxDone: {
    backgroundColor: colors.purple,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 52,
  },
  strip: {
    backgroundColor: colors.white,
    borderRadius: radii.cart,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: colors.ink,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  stripText: {
    fontFamily: fonts.body.semiBold,
    fontSize: 14,
    color: colors.ink,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
