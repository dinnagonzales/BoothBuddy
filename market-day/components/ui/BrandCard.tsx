import { Platform, StyleSheet, View, type ViewProps } from 'react-native';

import { colors } from '@/constants/theme';
import { tokens } from '@/theme/tokens';

type BrandCardProps = ViewProps & {
  /** white (default) or soft cream accent surface */
  surface?: 'white' | 'peach';
  padded?: boolean;
};

const cardShadow = Platform.select({
  web: { boxShadow: `0 10px 0 ${tokens.shadow.soft}` },
  default: {
    shadowColor: tokens.shadow.color,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 0,
    elevation: 2,
  },
});

/** Rounded card with soft ink-tinted shadow for StyleSheet screens. */
export function BrandCard({
  children,
  surface = 'white',
  padded = true,
  style,
  ...props
}: BrandCardProps) {
  return (
    <View
      style={[
        styles.card,
        surface === 'peach' ? styles.peach : styles.white,
        padded ? styles.padded : null,
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: tokens.radius.lg,
    ...cardShadow,
  },
  white: {
    backgroundColor: colors.white,
  },
  peach: {
    backgroundColor: colors.surfaceSubtle,
  },
  padded: {
    padding: tokens.spacing[5],
  },
});
