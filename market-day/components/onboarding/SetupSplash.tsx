import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BoothBuddyLogo } from '@/components/BoothBuddyLogo';
import { colors } from '@/constants/theme';
import { fonts } from '@/constants/visual';

const STATUS_MESSAGES = ['Loading your shop…', 'Almost there…', 'Ready!'] as const;

type SetupSplashProps = {
  /** 0–1 progress driven by the parent load. */
  progress: number;
  reduceMotion?: boolean;
  onReady?: () => void;
};

export function SetupSplash({ progress, reduceMotion = false, onReady }: SetupSplashProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const fill = useSharedValue(0);
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    fill.value = withTiming(clamped, {
      duration: reduceMotion ? 120 : 280,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped, fill, reduceMotion]);

  useEffect(() => {
    if (clamped < 0.4) setStatusIndex(0);
    else if (clamped < 0.95) setStatusIndex(1);
    else setStatusIndex(2);
  }, [clamped]);

  useEffect(() => {
    if (clamped < 1 || !onReady) return;
    // Wait a beat so "Ready!" is visible, and so the parent can finish setting destination.
    const timer = setTimeout(onReady, reduceMotion ? 200 : 450);
    return () => clearTimeout(timer);
  }, [clamped, onReady, reduceMotion]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fill.value * 100}%`,
  }));

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.center}>
        <View style={styles.mascotBadge}>
          <BoothBuddyLogo variant="fullSm" style={styles.mascot} />
        </View>
        <Text style={styles.wordmark}>Booth Buddy</Text>

        <View
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
          accessibilityLabel={STATUS_MESSAGES[statusIndex]}
          style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, fillStyle]} />
        </View>

        <Animated.Text
          key={STATUS_MESSAGES[statusIndex]}
          entering={FadeIn.duration(reduceMotion ? 120 : 200)}
          exiting={FadeOut.duration(reduceMotion ? 80 : 140)}
          style={styles.status}>
          {STATUS_MESSAGES[statusIndex]}
        </Animated.Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  mascotBadge: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 4,
  },
  mascot: {
    width: 88,
  },
  wordmark: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 28,
    color: colors.ink,
    textAlign: 'center',
  },
  progressTrack: {
    width: '100%',
    maxWidth: 220,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.white,
    overflow: 'hidden',
    marginTop: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.purple,
  },
  status: {
    fontFamily: fonts.body.semiBold,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    minHeight: 20,
  },
});
