import type { ReactNode } from 'react';
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
  businessSettingsEqual,
  normalizeBusinessSettings,
  normalizeVenmoHandle,
  type BusinessSettings,
} from '@/lib/business-settings';
import { getBusinessSettings, saveBusinessSettings } from '@/lib/db/business-settings';
import { formatPhoneNumber, formatZelleContactForInput } from '@/lib/contact-format';
import { deleteBusinessImage, pickBusinessImage, type BusinessImageKind } from '@/lib/local-image';

type BusinessSettingsFormProps = {
  db: SQLiteDatabase;
};

export function BusinessSettingsForm({ db }: BusinessSettingsFormProps) {
  const [saved, setSaved] = useState<BusinessSettings | null>(null);
  const [draft, setDraft] = useState<BusinessSettings | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const loadSettings = useCallback(async () => {
    const settings = await getBusinessSettings(db);
    const displaySettings = {
      ...settings,
      zelleContact: formatZelleContactForInput(settings.zelleContact),
    };
    setSaved(settings);
    setDraft(displaySettings);
  }, [db]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  if (!draft || !saved) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.loadingText}>Loading settings…</Text>
      </View>
    );
  }

  const normalizedDraft = normalizeBusinessSettings(draft);
  const dirty = !businessSettingsEqual(normalizedDraft, saved);
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
      const normalized = normalizeBusinessSettings(draft);

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
      setSaved(normalized);
      setDraft({
        ...normalized,
        zelleContact: formatZelleContactForInput(normalized.zelleContact),
      });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <SectionLabel>Business</SectionLabel>
      <View style={styles.card}>
        <Field label="Business name" style={styles.businessNameField}>
          <TextInput
            value={draft.businessName}
            onChangeText={(value) => updateDraft({ businessName: value })}
            placeholder="e.g. Emma's Dragon Shop"
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
            hint="Optional — upload a screenshot from your bank app."
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
            hint="Optional — upload your Venmo QR if you prefer a custom image."
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
  return (
    <View style={[styles.imageRow, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.imageHint}>{hint}</Text>
      <View style={styles.imageActions}>
        <Pressable
          accessibilityRole="button"
          onPress={onPick}
          style={[styles.imagePreview, square && styles.imagePreviewSquare]}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          ) : (
            <Text style={styles.imagePlaceholder}>{emptyLabel}</Text>
          )}
        </Pressable>
        {imageUri ? (
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
  businessNameField: {
    paddingBottom: 16,
  },
  businessLogoRow: {
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
    backgroundColor: '#F8F4FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E8E0F5',
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
    borderColor: '#E8E0F5',
    borderStyle: 'dashed',
    backgroundColor: '#F8F4FF',
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
    borderColor: '#FFD3D3',
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
    color: colors.white,
  },
});
