import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SetupPrimaryButton } from '@/components/onboarding/SetupPrimaryButton';
import { checkmarkScale } from '@/components/onboarding/setup-motion';
import { BrandCard } from '@/components/ui/BrandCard';
import { colors } from '@/constants/theme';
import { fonts } from '@/constants/visual';

const buddyImage = require('@/assets/images/buddy.png');

type SetupSuccessCardProps = {
  firstName: string;
  onContinue: () => void;
  reduceMotion?: boolean;
};

export function SetupSuccessCard({
  firstName,
  onContinue,
  reduceMotion = false,
}: SetupSuccessCardProps) {
  const scale = useSharedValue(reduceMotion ? 1 : 0.6);

  useEffect(() => {
    scale.value = checkmarkScale(reduceMotion);
  }, [reduceMotion, scale]);

  const buddyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const displayName = firstName.trim() || 'friend';

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.center}>
        <View style={styles.stack}>
          <Animated.View style={[styles.buddyWrap, buddyStyle]} pointerEvents="none">
            <Image
              source={buddyImage}
              style={styles.buddy}
              resizeMode="contain"
              accessibilityLabel="Booth Buddy"
            />
          </Animated.View>

          <BrandCard surface="peach" style={styles.card}>
            <Text style={styles.title}>You&apos;re all set, {displayName}!</Text>
            <Text style={styles.subtext}>Your shop is ready to go.</Text>

            <SetupPrimaryButton
              label="Go to my shop"
              onPress={onContinue}
              reduceMotion={reduceMotion}
            />
          </BrandCard>
        </View>
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
    paddingHorizontal: 20,
  },
  stack: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  buddyWrap: {
    zIndex: 2,
    marginBottom: -36,
  },
  buddy: {
    width: 112,
    height: 112,
  },
  card: {
    width: '100%',
    borderRadius: 28,
    paddingTop: 48,
    paddingBottom: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
    zIndex: 1,
  },
  title: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 22,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtext: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
});
