import { BoothBuddyLogo } from '@/components/BoothBuddyLogo';
import { BrandButton } from '@/components/ui/BrandButton';
import { BrandCard } from '@/components/ui/BrandCard';
import { BrandInput } from '@/components/ui/BrandInput';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
};

export function ProfileSetupCard({
  businessName,
  firstName,
  lastName,
  onBusinessNameChange,
  onFirstNameChange,
  onLastNameChange,
  onSave,
}: ProfileSetupCardProps) {
  const canSave = isProfileDraftValid({ businessName, firstName, lastName });

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.center}>
        <BrandCard surface="peach" style={styles.card}>
          <View style={styles.logoWrap}>
            <BoothBuddyLogo variant="full" style={styles.logo} />
          </View>

          <Text style={styles.title}>Your shop</Text>
          <Text style={styles.subtext}>
            Tell us about your business. Staff won&apos;t see this — it&apos;s for owner settings.
          </Text>

          <View style={styles.form}>
            <Field
              label="Business name"
              value={businessName}
              onChangeText={onBusinessNameChange}
            />
            <Field
              label="First name"
              value={firstName}
              onChangeText={onFirstNameChange}
              autoComplete="given-name"
            />
            <Field
              label="Last name"
              value={lastName}
              onChangeText={onLastNameChange}
              autoComplete="family-name"
            />

            <BrandButton
              label="Continue"
              onPress={onSave}
              disabled={!canSave}
              style={!canSave ? styles.buttonDisabled : undefined}
            />
          </View>
        </BrandCard>
      </View>
    </SafeAreaView>
  );
}

function isProfileDraftValid(input: {
  businessName: string;
  firstName: string;
  lastName: string;
}): boolean {
  const normalized = normalizeAdminProfile(input);
  return (
    normalized.businessName.length > 0 &&
    normalized.firstName.length > 0 &&
    normalized.lastName.length > 0
  );
}

function Field({
  label,
  ...props
}: {
  label: string;
} & ComponentProps<typeof BrandInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <BrandInput {...props} />
    </View>
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
    paddingVertical: 32,
    paddingHorizontal: 28,
  },
  logoWrap: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 96,
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
  field: {
    gap: 8,
  },
  label: {
    fontFamily: fonts.body.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
});
