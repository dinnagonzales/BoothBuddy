import { Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/constants/theme';
import { fonts, touchTargets } from '@/constants/visual';
import { tokens } from '@/theme/tokens';
import { SETUP_PRESS_MS } from '@/components/onboarding/setup-motion';

type SetupPrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  reduceMotion?: boolean;
  style?: ViewStyle;
};

export function SetupPrimaryButton({
  label,
  onPress,
  disabled,
  reduceMotion = false,
  style,
}: SetupPrimaryButtonProps) {
  const scale = useSharedValue(1);
  const shadowY = useSharedValue(5);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: 5 - shadowY.value }],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    paddingBottom: shadowY.value,
  }));

  const pressIn = () => {
    if (disabled) return;
    if (reduceMotion) {
      scale.value = 0.97;
      shadowY.value = 2;
      return;
    }
    scale.value = withTiming(0.97, { duration: SETUP_PRESS_MS });
    shadowY.value = withTiming(2, { duration: SETUP_PRESS_MS });
  };

  const pressOut = () => {
    if (reduceMotion) {
      scale.value = 1;
      shadowY.value = 5;
      return;
    }
    scale.value = withSpring(1, { damping: 14, stiffness: 260 });
    shadowY.value = withSpring(5, { damping: 14, stiffness: 260 });
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Animated.View
        style={[
          styles.outer,
          shadowStyle,
          disabled ? styles.disabled : null,
          Platform.select({
            web: { boxShadow: `0 5px 0 ${colors.purpleDark}` },
            default: {
              shadowColor: colors.purpleDark,
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 0,
            },
          }),
        ]}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: Boolean(disabled) }}
          disabled={disabled}
          onPress={onPress}
          onPressIn={pressIn}
          onPressOut={pressOut}
          style={styles.pressable}>
          <View style={styles.inner}>
            <Text style={styles.label}>{label}</Text>
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: tokens.radius.lg,
    backgroundColor: colors.purpleDark,
    minHeight: touchTargets.minSize,
  },
  pressable: {
    minHeight: touchTargets.minSize,
  },
  inner: {
    backgroundColor: colors.purple,
    borderRadius: tokens.radius.lg,
    paddingVertical: 18,
    paddingHorizontal: tokens.spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: touchTargets.minSize,
  },
  label: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 17,
    color: colors.white,
  },
  disabled: {
    opacity: 0.5,
  },
});
