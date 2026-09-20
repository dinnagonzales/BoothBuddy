import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BoothBuddyLogo } from '@/components/BoothBuddyLogo';
import { FloatingLabelInput } from '@/components/onboarding/FloatingLabelInput';
import { SetupPrimaryButton } from '@/components/onboarding/SetupPrimaryButton';
import { StepDots } from '@/components/onboarding/StepDots';
import { shakeTranslateX } from '@/components/onboarding/setup-motion';
import { BrandCard } from '@/components/ui/BrandCard';
import { colors } from '@/constants/theme';
import { fonts } from '@/constants/visual';
import { normalizeAdminProfile } from '@/lib/admin-profile';

type ProfileSetupCardProps = {
  businessName: string;
  firstName: string;
  lastName: string;
  onBusinessNameChange: (value: string) => void;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onSave: () => void;
  reduceMotion?: boolean;
};

export function ProfileSetupCard({
  businessName,
  firstName,
  lastName,
  onBusinessNameChange,
  onFirstNameChange,
  onLastNameChange,
  onSave,
  reduceMotion = false,
}: ProfileSetupCardProps) {
  const businessRef = useRef<TextInput>(null);
  const firstNameRef = useRef<TextInput>(null);
  const [businessError, setBusinessError] = useState<string | null>(null);
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const shakeX = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  useEffect(() => {
    if (!businessError) return;
    shakeX.value = shakeTranslateX(reduceMotion);
  }, [businessError, reduceMotion, shakeX]);

  useEffect(() => {
    if (!firstNameError || businessError) return;
    shakeX.value = shakeTranslateX(reduceMotion);
  }, [firstNameError, businessError, reduceMotion, shakeX]);

  const handleContinue = () => {
    const normalized = normalizeAdminProfile({ businessName, firstName, lastName });
    const nextBusinessError =
      normalized.businessName.length === 0 ? 'Enter your business name to continue' : null;
    const nextFirstNameError =
      normalized.firstName.length === 0 ? 'Enter your first name to continue' : null;

    setBusinessError(nextBusinessError);
    setFirstNameError(nextFirstNameError);

    if (nextBusinessError) {
      businessRef.current?.focus();
      return;
    }
    if (nextFirstNameError) {
      firstNameRef.current?.focus();
      return;
    }

    onSave();
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.topBar}>
        <BoothBuddyLogo variant="long" />
      </View>

      <View style={styles.center}>
        <StepDots activeIndex={0} />
        <BrandCard surface="peach" style={styles.card}>
          <Animated.View style={shakeStyle}>
            <Text style={styles.title}>Welcome to Booth Buddy!</Text>
            <Text style={styles.subtext}>Just for you — your staff won&apos;t see this.</Text>

            <View style={styles.form}>
              <FloatingLabelInput
                label="Business name *"
                placeholder="e.g. Chupa Chups Booth"
                value={businessName}
                onChangeText={(value) => {
                  onBusinessNameChange(value);
                  if (businessError) setBusinessError(null);
                }}
                error={businessError}
                inputRef={businessRef}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => firstNameRef.current?.focus()}
              />
              <FloatingLabelInput
                label="Your first name *"
                placeholder="e.g. Dinna"
                value={firstName}
                onChangeText={(value) => {
                  onFirstNameChange(value);
                  if (firstNameError) setFirstNameError(null);
                }}
                error={firstNameError}
                inputRef={firstNameRef}
                autoComplete="given-name"
                autoCapitalize="words"
                returnKeyType="next"
              />
              <FloatingLabelInput
                label="Last name (optional)"
                placeholder="e.g. Reyes"
                value={lastName}
                onChangeText={onLastNameChange}
                autoComplete="family-name"
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />

              <SetupPrimaryButton
                label="Continue"
                onPress={handleContinue}
                reduceMotion={reduceMotion}
              />
            </View>
          </Animated.View>
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
  topBar: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 8,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 24,
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
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
});
