import { Check } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SetupPrimaryButton } from '@/components/onboarding/SetupPrimaryButton';
import { checkmarkScale } from '@/components/onboarding/setup-motion';
import { BrandCard } from '@/components/ui/BrandCard';
import { UiIcon } from '@/components/ui/UiIcon';
import { colors } from '@/constants/theme';
import { fonts } from '@/constants/visual';

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

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const displayName = firstName.trim() || 'friend';

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.center}>
        <BrandCard surface="peach" style={styles.card}>
          <Animated.View style={[styles.checkCircle, checkStyle]}>
            <UiIcon icon={Check} size={36} color={colors.white} />
          </Animated.View>

          <Text style={styles.title}>You&apos;re all set, {displayName}!</Text>
          <Text style={styles.subtext}>Your shop is ready to go.</Text>

          <SetupPrimaryButton
            label="Go to my shop"
            onPress={onContinue}
            reduceMotion={reduceMotion}
          />
        </BrandCard>
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
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
