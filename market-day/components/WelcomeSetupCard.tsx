import { BoothBuddyLogo } from '@/components/BoothBuddyLogo';
import { BrandButton } from '@/components/ui/BrandButton';
import { BrandCard } from '@/components/ui/BrandCard';
import { UiIcon } from '@/components/ui/UiIcon';
import { colors } from '@/constants/theme';
import { fonts } from '@/constants/visual';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings } from 'lucide-react-native';

type WelcomeSetupCardProps = {
  onContinue: () => void;
};

export function WelcomeSetupCard({ onContinue }: WelcomeSetupCardProps) {
  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.topBar}>
        <BoothBuddyLogo variant="long" />
      </View>

      <View style={styles.center}>
        <BrandCard surface="peach" style={styles.card}>
          <Text style={styles.title}>Welcome to Booth Buddy!</Text>
          <Text style={styles.subtext}>Ring up sales from a phone or tablet.</Text>

          <View style={styles.sections}>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>For staff</Text>
              <Bullet>Tap Make a Sale to ring up customers anytime</Bullet>
              <Bullet>See today&apos;s Menu when a Market Day is running</Bullet>
              <Bullet>Use + Pre-order for pickup later</Bullet>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>For owners</Text>
              <Bullet>Next: set a Pass Code and add your first item</Bullet>
              <Bullet>
                <View style={styles.bulletInline}>
                  <Text style={styles.bulletText}>Tap </Text>
                  <UiIcon icon={Settings} size={14} color={colors.ink} />
                  <Text style={styles.bulletText}> anytime to manage inventory, events, and sales</Text>
                </View>
              </Bullet>
            </View>
          </View>

          <BrandButton label="Get started" onPress={onContinue} />
        </BrandCard>
      </View>
    </SafeAreaView>
  );
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>•</Text>
      {typeof children === 'string' ? (
        <Text style={styles.bulletText}>{children}</Text>
      ) : (
        children
      )}
    </View>
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
    paddingBottom: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 28,
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
  sections: {
    gap: 20,
    marginBottom: 24,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: fonts.body.bold,
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
    fontFamily: fonts.body.bold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.purple,
  },
  bulletText: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },
  bulletInline: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
  },
});
