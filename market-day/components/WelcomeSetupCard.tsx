import { BoothBuddyLogo } from '@/components/BoothBuddyLogo';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';

type WelcomeSetupCardProps = {
  onContinue: () => void;
};

export function WelcomeSetupCard({ onContinue }: WelcomeSetupCardProps) {
  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.center}>
        <View style={styles.card}>
          <View style={styles.logoWrap}>
            <BoothBuddyLogo variant="fullSm" />
          </View>

          <Text style={styles.title}>Welcome to Booth Buddy</Text>
          <Text style={styles.subtext}>Your shop on a phone or tablet.</Text>

          <View style={styles.sections}>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>For staff</Text>
              <Bullet>Tap Make a Sale to ring up customers anytime</Bullet>
              <Bullet>See today&apos;s Menu when a Market Day is running</Bullet>
              <Bullet>Use + Pre-order for pickup later</Bullet>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>For owners</Text>
              <Bullet>Next you&apos;ll set a Pass Code and add your first item</Bullet>
              <Bullet>Tap ⚙️ anytime to manage inventory, events, and sales</Bullet>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onContinue}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
            <Text style={styles.buttonLabel}>Get started</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Bullet({ children }: { children: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

const cardShadow = Platform.select({
  web: { boxShadow: '0 10px 0 rgba(43, 35, 64, 0.06)' },
  default: {
    shadowColor: '#2B2340',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 0,
    elevation: 2,
  },
});

const buttonShadow = Platform.select({
  web: { boxShadow: `0 5px 0 ${colors.purpleDark}` },
  default: {
    shadowColor: colors.purpleDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
});

const buttonShadowPressed = Platform.select({
  web: { boxShadow: `0 2px 0 ${colors.purpleDark}` },
  default: {
    shadowOffset: { width: 0, height: 2 },
  },
});

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
    backgroundColor: colors.background,
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 28,
    ...cardShadow,
  },
  logoWrap: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 22,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtext: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  sections: {
    gap: 20,
    marginBottom: 24,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    lineHeight: 20,
    color: colors.purple,
  },
  bulletText: {
    flex: 1,
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },
  button: {
    backgroundColor: colors.purple,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    ...buttonShadow,
  },
  buttonPressed: {
    transform: [{ translateY: 3 }],
    ...buttonShadowPressed,
  },
  buttonLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 17,
    color: colors.white,
  },
});
