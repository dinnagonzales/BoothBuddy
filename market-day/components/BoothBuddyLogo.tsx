import { Image, StyleSheet, type ImageStyle, type StyleProp } from 'react-native';

const logos = {
  long: require('@/assets/images/logo-long.png'),
  full: require('@/assets/images/logo-full-sm.png'),
  fullSm: require('@/assets/images/logo-full-sm.png'),
  app: require('@/assets/images/logo-app.png'),
} as const;

export type BoothBuddyLogoVariant = keyof typeof logos;

type BoothBuddyLogoProps = {
  variant: BoothBuddyLogoVariant;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
};

export function BoothBuddyLogo({
  variant,
  style,
  accessibilityLabel = 'Booth Buddy',
}: BoothBuddyLogoProps) {
  return (
    <Image
      source={logos[variant]}
      style={[styles[variant], style]}
      resizeMode="contain"
      accessibilityLabel={accessibilityLabel}
    />
  );
}

const styles = StyleSheet.create({
  long: {
    height: 32,
    aspectRatio: 1024 / 294,
  },
  full: {
    width: 96,
    aspectRatio: 1001 / 1024,
  },
  fullSm: {
    width: 100,
    aspectRatio: 200 / 204,
  },
  app: {
    width: 72,
    aspectRatio: 1015 / 1024,
  },
});
