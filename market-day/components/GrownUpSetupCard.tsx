import { ChevronLeft, Lock } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PasscodeKeypad } from '@/components/onboarding/PasscodeKeypad';
import { StepDots } from '@/components/onboarding/StepDots';
import { digitPopScale, shakeTranslateX } from '@/components/onboarding/setup-motion';
import { BrandCard } from '@/components/ui/BrandCard';
import { UiIcon } from '@/components/ui/UiIcon';
import { colors } from '@/constants/theme';
import { fonts, touchTargets } from '@/constants/visual';
import { PARENTAL_CODE_MAX_LENGTH } from '@/lib/parental-gate';

type GrownUpSetupCardProps = {
  onBack: () => void;
  onComplete: (code: string) => void;
  reduceMotion?: boolean;
};

type Phase = 'create' | 'confirm';

export function GrownUpSetupCard({
  onBack,
  onComplete,
  reduceMotion = false,
}: GrownUpSetupCardProps) {
  const [phase, setPhase] = useState<Phase>('create');
  const [code, setCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [matchedMessage, setMatchedMessage] = useState(false);

  const phaseRef = useRef(phase);
  const codeRef = useRef(code);
  const confirmCodeRef = useRef(confirmCode);
  const onCompleteRef = useRef(onComplete);
  const advancingRef = useRef(false);
  const completingRef = useRef(false);

  phaseRef.current = phase;
  codeRef.current = code;
  confirmCodeRef.current = confirmCode;
  onCompleteRef.current = onComplete;

  const entry = phase === 'create' ? code : confirmCode;
  const shakeX = useSharedValue(0);
  const boxScales = [
    useSharedValue(1),
    useSharedValue(1),
    useSharedValue(1),
    useSharedValue(1),
  ];

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const box0 = useAnimatedStyle(() => ({ transform: [{ scale: boxScales[0].value }] }));
  const box1 = useAnimatedStyle(() => ({ transform: [{ scale: boxScales[1].value }] }));
  const box2 = useAnimatedStyle(() => ({ transform: [{ scale: boxScales[2].value }] }));
  const box3 = useAnimatedStyle(() => ({ transform: [{ scale: boxScales[3].value }] }));
  const boxStyles = [box0, box1, box2, box3];

  const popDigit = (index: number) => {
    boxScales[index].value = digitPopScale(reduceMotion);
  };

  useEffect(() => {
    return () => {
      advancingRef.current = false;
      completingRef.current = false;
    };
  }, []);

  const handleDigit = (digit: string) => {
    if (matchedMessage || advancingRef.current || completingRef.current) return;

    const currentPhase = phaseRef.current;
    const currentEntry =
      currentPhase === 'create' ? codeRef.current : confirmCodeRef.current;
    if (currentEntry.length >= PARENTAL_CODE_MAX_LENGTH) return;

    setError(null);
    const next = currentEntry + digit;
    popDigit(next.length - 1);

    if (currentPhase === 'create') {
      codeRef.current = next;
      setCode(next);
      if (next.length < PARENTAL_CODE_MAX_LENGTH) return;

      advancingRef.current = true;
      setTimeout(() => {
        setPhase('confirm');
        setConfirmCode('');
        confirmCodeRef.current = '';
        setError(null);
        advancingRef.current = false;
      }, reduceMotion ? 120 : 220);
      return;
    }

    confirmCodeRef.current = next;
    setConfirmCode(next);
    if (next.length < PARENTAL_CODE_MAX_LENGTH) return;

    if (next !== codeRef.current) {
      setError("Codes don't match — try again");
      shakeX.value = shakeTranslateX(reduceMotion);
      setTimeout(() => {
        setConfirmCode('');
        confirmCodeRef.current = '';
      }, 320);
      return;
    }

    completingRef.current = true;
    setMatchedMessage(true);
    setTimeout(() => {
      onCompleteRef.current(codeRef.current);
    }, reduceMotion ? 280 : 700);
  };

  const handleBackspace = () => {
    if (matchedMessage || advancingRef.current || completingRef.current) return;
    setError(null);
    if (phase === 'create') {
      const next = codeRef.current.slice(0, -1);
      codeRef.current = next;
      setCode(next);
    } else {
      const next = confirmCodeRef.current.slice(0, -1);
      confirmCodeRef.current = next;
      setConfirmCode(next);
    }
  };

  const headline = phase === 'create' ? 'Set a passcode' : 'Confirm your passcode';
  const subcopy =
    phase === 'create' ? 'Protects your Settings menu.' : 'Enter it one more time.';

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.center}>
        <View style={styles.topRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={onBack}
            style={styles.backButton}
            hitSlop={8}>
            <UiIcon icon={ChevronLeft} size={24} color={colors.ink} />
          </Pressable>
          <StepDots activeIndex={1} />
          <View style={styles.backButton} />
        </View>

        <BrandCard surface="peach" style={styles.card}>
          <View style={styles.logoWrap}>
            <View style={styles.lockBadge}>
              <UiIcon icon={Lock} size={26} color={colors.purpleDark} />
            </View>
          </View>

          <Text style={styles.title}>{headline}</Text>
          <Text style={styles.subtext}>{subcopy}</Text>
          {phase === 'create' ? (
            <Text style={styles.subtextMuted}>You can turn this off anytime in Settings.</Text>
          ) : (
            <View style={styles.subtextMutedSpacer} />
          )}

          <Animated.View style={[styles.boxesRow, shakeStyle]}>
            {Array.from({ length: PARENTAL_CODE_MAX_LENGTH }, (_, index) => {
              const filled = index < entry.length;
              return (
                <Animated.View
                  key={index}
                  accessibilityLabel={`Passcode digit ${index + 1}`}
                  style={[
                    styles.box,
                    filled && styles.boxFilled,
                    error ? styles.boxError : null,
                    boxStyles[index],
                  ]}>
                  {filled ? <View style={styles.dot} /> : null}
                </Animated.View>
              );
            })}
          </Animated.View>

          {error ? (
            <Text accessibilityLiveRegion="assertive" style={styles.error}>
              {error}
            </Text>
          ) : matchedMessage ? (
            <Text accessibilityLiveRegion="polite" style={styles.success}>
              Passcode set ✓
            </Text>
          ) : (
            <View style={styles.messageSpacer} />
          )}

          <PasscodeKeypad
            onDigit={handleDigit}
            onBackspace={handleBackspace}
            disabled={matchedMessage}
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
    gap: 12,
  },
  topRow: {
    width: '100%',
    maxWidth: 380,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: touchTargets.minSize,
    height: touchTargets.minSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 24,
  },
  logoWrap: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  lockBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  subtextMuted: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 4,
    marginBottom: 20,
    opacity: 0.85,
  },
  subtextMutedSpacer: {
    height: 20,
    marginBottom: 20,
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
    marginTop: 4,
  },
  box: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: {
    borderColor: colors.pink,
    backgroundColor: colors.surfaceMuted,
  },
  boxError: {
    borderColor: colors.borderDanger,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.ink,
  },
  error: {
    fontFamily: fonts.body.bold,
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 12,
    minHeight: 18,
  },
  success: {
    fontFamily: fonts.body.bold,
    fontSize: 13,
    color: colors.greenDark,
    textAlign: 'center',
    marginBottom: 12,
    minHeight: 18,
  },
  messageSpacer: {
    height: 18,
    marginBottom: 12,
  },
});
