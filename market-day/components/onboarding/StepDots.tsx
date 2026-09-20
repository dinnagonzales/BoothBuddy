import { StyleSheet, View } from 'react-native';

import { colors } from '@/constants/theme';

type StepDotsProps = {
  total?: number;
  activeIndex: number;
};

export function StepDots({ total = 2, activeIndex }: StepDotsProps) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: total, now: activeIndex + 1 }}
      accessibilityLabel={`Step ${activeIndex + 1} of ${total}`}
      style={styles.row}>
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          style={[styles.dot, index === activeIndex ? styles.dotActive : styles.dotIdle]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotIdle: {
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.purple,
    width: 18,
  },
});
