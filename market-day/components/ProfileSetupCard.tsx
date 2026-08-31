import type { ComponentProps } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';
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
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>🏪</Text>
          </View>

          <Text style={styles.title}>Your shop</Text>
          <Text style={styles.subtext}>
            Tell us about your business. The seller won&apos;t see this — it&apos;s for grown-up settings.
          </Text>

          <View style={styles.form}>
            <Field
              label="Business name"
              value={businessName}
              onChangeText={onBusinessNameChange}
              placeholder="Dragon Shop"
            />
            <Field
              label="First name"
              value={firstName}
              onChangeText={onFirstNameChange}
              placeholder="Emma"
              autoComplete="given-name"
            />
            <Field
              label="Last name"
              value={lastName}
              onChangeText={onLastNameChange}
              placeholder="Gonzalez"
              autoComplete="family-name"
            />

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSave }}
              disabled={!canSave}
              onPress={onSave}
              style={({ pressed }) => [
                styles.button,
                !canSave && styles.buttonDisabled,
                pressed && canSave && styles.buttonPressed,
              ]}>
              <Text style={styles.buttonLabel}>Continue</Text>
            </Pressable>
          </View>
        </View>
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
} & ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...props} style={styles.input} placeholderTextColor={colors.inkSoft} />
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
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.purple,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconEmoji: {
    fontSize: 26,
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
  form: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: colors.ink,
  },
  button: {
    backgroundColor: colors.purple,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 4,
    ...buttonShadow,
  },
  buttonDisabled: {
    opacity: 0.45,
    ...Platform.select({
      web: { boxShadow: 'none' },
      default: { shadowOpacity: 0 },
    }),
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
