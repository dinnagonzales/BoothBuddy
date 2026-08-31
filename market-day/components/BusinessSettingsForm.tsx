import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ChangePasscodeCard } from '@/components/ChangePasscodeCard';
import { PasscodeGateSettings } from '@/components/PasscodeGateSettings';
import { ExpandableCard } from '@/components/ExpandableCard';
import { SectionLabel } from '@/components/Screen';
import { colors } from '@/constants/theme';
import { fonts, radii } from '@/constants/visual';
import {
  adminProfileEqual,
  normalizeAdminProfile,
  type AdminProfile,
} from '@/lib/admin-profile';
import {
  businessSettingsEqual,
  normalizeBusinessSettings,
  normalizeOptionalUri,
  normalizeVenmoHandle,
  type BusinessSettings,
} from '@/lib/business-settings';
import { getAdminProfile, saveAdminProfile } from '@/lib/db/admin-profile';
import { getBusinessSettings, saveBusinessSettings } from '@/lib/db/business-settings';
import { formatPhoneNumber, formatZelleContactForInput } from '@/lib/contact-format';
import { deviceParentalGate } from '@/lib/device-parental-gate';
import { deleteBusinessImage, pickBusinessImage, type BusinessImageKind } from '@/lib/local-image';
import { resetAppForForgottenCode } from '@/lib/reset-app';

type BusinessSettingsFormProps = {
  db: SQLiteDatabase;
};

export function BusinessSettingsForm({ db }: BusinessSettingsFormProps) {
  const router = useRouter();
  const [saved, setSaved] = useState<BusinessSettings | null>(null);
  const [draft, setDraft] = useState<BusinessSettings | null>(null);
  const [savedProfile, setSavedProfile] = useState<AdminProfile | null>(null);
  const [profileDraft, setProfileDraft] = useState<AdminProfile | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const loadSettings = useCallback(async () => {
    const [settings, profile] = await Promise.all([getBusinessSettings(db), getAdminProfile(db)]);
    const displaySettings = {
      ...settings,
      zelleContact: formatZelleContactForInput(settings.zelleContact),
    };
    setSaved(settings);
    setDraft(displaySettings);
    setSavedProfile(profile);
    setProfileDraft(profile);
  }, [db]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  if (!draft || !saved || !profileDraft || !savedProfile) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.loadingText}>Loading settings…</Text>
      </View>
    );
  }

  const normalizedDraft = normalizeBusinessSettings(draft);
  const normalizedProfileDraft = normalizeAdminProfile(profileDraft);
  const dirty =
    !businessSettingsEqual(normalizedDraft, saved) ||
    !adminProfileEqual(normalizedProfileDraft, savedProfile);
  const canSave = dirty && !saving;

  const updateDraft = (patch: Partial<BusinessSettings>) => {
    setDraft((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      if (patch.venmoHandle != null) {
        next.venmoHandle = normalizeVenmoHandle(patch.venmoHandle);
      }
      return next;
    });
  };

  const updateProfileDraft = (patch: Partial<AdminProfile>) => {
    setProfileDraft((current) => (current ? { ...current, ...patch } : current));
  };

  const pickImage = async (kind: BusinessImageKind, field: 'businessLogoUri' | 'zelleQrUri' | 'venmoQrUri') => {
    try {
      const uri = await pickBusinessImage(kind);
      if (!uri) return;

      const previous = draft[field];
      if (previous && previous !== uri) {
        await deleteBusinessImage(previous);
      }
      updateDraft({ [field]: uri });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not pick that image.';
      Alert.alert('Photo error', message);
    }
  };

  const removeImage = async (field: 'businessLogoUri' | 'zelleQrUri' | 'venmoQrUri') => {
    const previous = draft[field];
    if (previous) {
      await deleteBusinessImage(previous);
    }
    updateDraft({ [field]: null });
  };

  const saveChanges = async () => {
    if (!canSave) return;

    setSaving(true);
    try {
      const normalized = normalizeBusinessSettings({
        ...draft,
        businessName: normalizedProfileDraft.businessName,
      });
      const normalizedProfile = normalizeAdminProfile(profileDraft);

      if (saved.businessLogoUri && saved.businessLogoUri !== normalized.businessLogoUri) {
        await deleteBusinessImage(saved.businessLogoUri);
      }
      if (saved.zelleQrUri && saved.zelleQrUri !== normalized.zelleQrUri) {
        await deleteBusinessImage(saved.zelleQrUri);
      }
      if (saved.venmoQrUri && saved.venmoQrUri !== normalized.venmoQrUri) {
        await deleteBusinessImage(saved.venmoQrUri);
      }

      await saveBusinessSettings(db, normalized);
      await saveAdminProfile(db, normalizedProfile);
      setSaved(normalized);
      setSavedProfile(normalizedProfile);
      setDraft({
        ...normalized,
        zelleContact: formatZelleContactForInput(normalized.zelleContact),
      });
      setProfileDraft(normalizedProfile);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const replayOnboarding = () => {
    Alert.alert(
      'Replay onboarding?',
      'This clears shop data and your Pass Code, then restarts at Welcome.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Replay',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              await resetAppForForgottenCode(db, deviceParentalGate);
              router.replace('/setup');
            })();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.wrap}>
      <SectionLabel>Your shop</SectionLabel>
      <View style={styles.card}>
        <Field label="Business name">
          <TextInput
            value={profileDraft.businessName}
            onChangeText={(value) => updateProfileDraft({ businessName: value })}
            placeholderTextColor={colors.inkSoft}
            style={styles.fieldInput}
          />
        </Field>

        <Field label="First name">
          <TextInput
            value={profileDraft.firstName}
            onChangeText={(value) => updateProfileDraft({ firstName: value })}
            autoComplete="given-name"
            placeholderTextColor={colors.inkSoft}
            style={styles.fieldInput}
          />
        </Field>

        <Field label="Last name">
          <TextInput
            value={profileDraft.lastName}
            onChangeText={(value) => updateProfileDraft({ lastName: value })}
            autoComplete="family-name"
            placeholderTextColor={colors.inkSoft}
            style={styles.fieldInput}
          />
        </Field>

        <ImagePickerRow
          label="Business logo"
          hint="Square logo shown on receipts and checkout."
          imageUri={draft.businessLogoUri}
          emptyLabel="Add logo"
          onPick={() => void pickImage('logo', 'businessLogoUri')}
          onRemove={() => void removeImage('businessLogoUri')}
          square
          style={styles.businessLogoRow}
        />
      </View>

      <ChangePasscodeCard />
      <PasscodeGateSettings db={db} />

      <SectionLabel>Payment</SectionLabel>
      <ExpandableCard
        expanded={paymentOpen}
        onHeaderPress={() => setPaymentOpen((open) => !open)}
        accessibilityLabel="Payment settings"
        style={styles.card}
        headerStyle={styles.cardHeader}
        header={
          <>
            <Text style={styles.cardTitle}>📱 Venmo / Zelle</Text>
            <Text style={styles.cardChevron}>{paymentOpen ? '▾' : '▸'}</Text>
          </>
        }>
        <View style={styles.paymentBody}>
          <Field label="Zelle full name">
            <TextInput
              value={draft.zelleName}
              onChangeText={(value) => updateDraft({ zelleName: value })}
              placeholder="e.g. Emma Gonzalez"
              placeholderTextColor={colors.inkSoft}
              autoCapitalize="words"
              style={styles.fieldInput}
            />
            <Text style={styles.fieldHint}>Customers check this name in their bank app.</Text>
          </Field>

          <Field label="Zelle email or phone">
            <TextInput
              value={draft.zelleContact}
              onChangeText={(value) => {
                if (value.includes('@')) {
                  updateDraft({ zelleContact: value });
                } else {
                  updateDraft({ zelleContact: formatPhoneNumber(value) });
                }
              }}
              placeholder="mom@email.com or (555) 123-4567"
              placeholderTextColor={colors.inkSoft}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.fieldInput}
            />
          </Field>

          <ImagePickerRow
            label="Zelle QR code"
            hint="Bank app screenshot (optional)."
            imageUri={draft.zelleQrUri}
            emptyLabel="Upload Zelle QR"
            onPick={() => void pickImage('zelle-qr', 'zelleQrUri')}
            onRemove={() => void removeImage('zelleQrUri')}
          />

          <Field label="Venmo username">
            <TextInput
              value={draft.venmoHandle}
              onChangeText={(value) => updateDraft({ venmoHandle: value })}
              placeholder="@your-venmo"
              placeholderTextColor={colors.inkSoft}
              autoCapitalize="none"
              style={styles.fieldInput}
            />
          </Field>

          <ImagePickerRow
            label="Venmo QR code"
            hint="Custom Venmo QR image (optional)."
            imageUri={draft.venmoQrUri}
            emptyLabel="Upload Venmo QR"
            onPick={() => void pickImage('venmo-qr', 'venmoQrUri')}
            onRemove={() => void removeImage('venmoQrUri')}
          />
        </View>
      </ExpandableCard>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSave }}
        disabled={!canSave}
        onPress={() => void saveChanges()}
        style={({ pressed }) => [
          styles.saveButton,
          !canSave && styles.saveButtonDisabled,
          pressed && canSave && styles.saveButtonPressed,
        ]}>
        <Text style={styles.saveButtonLabel}>
          {savedFlash ? 'Saved ✓' : saving ? 'Saving…' : 'Save changes'}
        </Text>
      </Pressable>

      {__DEV__ ? (
        <Pressable accessibilityRole="button" onPress={replayOnboarding} style={styles.replayButton}>
          <Text style={styles.replayButtonLabel}>Replay onboarding</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Field({
  label,
  children,
  style,
}: {
  label: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function ImagePickerRow({
  label,
  hint,
  imageUri,
  emptyLabel,
  onPick,
  onRemove,
  square = false,
  style,
}: {
  label: string;
  hint: string;
  imageUri: string | null;
  emptyLabel: string;
  onPick: () => void;
  onRemove: () => void;
  square?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const resolvedUri = normalizeOptionalUri(imageUri);
  const [imageReady, setImageReady] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageReady(false);
    setImageFailed(false);
  }, [resolvedUri]);

  const showRemove = imageReady;
  const showLoadedImage = resolvedUri != null && !imageFailed;

  return (
    <View style={[styles.imageRow, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.imageHint}>{hint}</Text>
      <View style={styles.imageActions}>
        <Pressable
          accessibilityRole="button"
          onPress={onPick}
          style={[styles.imagePreview, square && styles.imagePreviewSquare]}>
          {showLoadedImage ? (
            <Image
              source={{ uri: resolvedUri }}
              style={styles.image}
              resizeMode="cover"
              onLoad={() => setImageReady(true)}
              onError={() => {
                setImageReady(false);
                setImageFailed(true);
              }}
            />
          ) : (
            <Text style={styles.imagePlaceholder}>{emptyLabel}</Text>
          )}
        </Pressable>
        {showRemove ? (
          <Pressable accessibilityRole="button" onPress={onRemove} style={styles.removeButton}>
            <Text style={styles.removeButtonLabel}>Remove</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

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

const styles = StyleSheet.create({
  wrap: {
    gap: 4,
  },
  loadingWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: fonts.body.bold,
    fontSize: 14,
    color: colors.inkSoft,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.settingsRow,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  cardTitle: {
    fontFamily: fonts.body.extraBold,
    fontSize: 14,
    color: colors.ink,
  },
  cardChevron: {
    fontFamily: fonts.body.extraBold,
    fontSize: 16,
    color: colors.purpleDark,
    lineHeight: 18,
  },
  paymentBody: {
    gap: 14,
    paddingHorizontal: 14,
    paddingBottom: 16,
    paddingTop: 4,
  },
  field: {
    paddingHorizontal: 14,
    paddingTop: 14,
    gap: 6,
  },
  businessLogoRow: {
    paddingTop: 14,
    paddingBottom: 16,
  },
  fieldLabel: {
    fontFamily: fonts.body.extraBold,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  fieldInput: {
    fontFamily: fonts.body.semiBold,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  fieldHint: {
    fontFamily: fonts.body.semiBold,
    fontSize: 12,
    color: colors.inkSoft,
    lineHeight: 17,
  },
  imageRow: {
    paddingHorizontal: 14,
    gap: 6,
  },
  imageHint: {
    fontFamily: fonts.body.semiBold,
    fontSize: 12,
    color: colors.inkSoft,
    lineHeight: 17,
  },
  imageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.borderSubtle,
    borderStyle: 'dashed',
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagePreviewSquare: {
    width: 96,
    height: 96,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 13,
    color: colors.purpleDark,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  removeButton: {
    borderWidth: 2,
    borderColor: colors.borderDanger,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  removeButtonLabel: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 13,
    color: colors.redDark,
  },
  saveButton: {
    backgroundColor: colors.purple,
    borderRadius: radii.completeBtn,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
    ...buttonShadow,
  },
  saveButtonDisabled: {
    opacity: 0.45,
    ...Platform.select({
      web: { boxShadow: 'none' },
      default: { shadowOpacity: 0 },
    }),
  },
  saveButtonPressed: {
    transform: [{ translateY: 3 }],
  },
  saveButtonLabel: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 16,
    color: colors.ink,
  },
  replayButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  replayButtonLabel: {
    fontFamily: fonts.body.bold,
    fontSize: 13,
    color: colors.purpleDark,
    textDecorationLine: 'underline',
  },
});
