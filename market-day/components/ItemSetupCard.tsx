import { BrandButton } from '@/components/ui/BrandButton';
import { BrandCard } from '@/components/ui/BrandCard';
import { BrandInput } from '@/components/ui/BrandInput';
import { IconInput } from '@/components/ui/IconInput';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';
import { fonts } from '@/constants/visual';
import { parseMoneyInput } from '@/lib/money';

type ItemSetupCardProps = {
  icon: string;
  name: string;
  cost: string;
  price: string;
  onIconChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onCostChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onSave: () => void;
};

export function ItemSetupCard({
  icon,
  name,
  cost,
  price,
  onIconChange,
  onNameChange,
  onCostChange,
  onPriceChange,
  onSave,
}: ItemSetupCardProps) {
  const canSave = name.trim().length > 0 && parseMoneyInput(price) > 0;

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.center}>
        <BrandCard surface="peach" style={styles.card}>
          <Text style={styles.title}>Add your first Item</Text>
          <Text style={styles.subtext}>
            Staff need at least one item on Home. Cost is owner-only.
          </Text>

          <View style={styles.form}>
            <Field label="Icon" value={icon} onChangeText={onIconChange} iconInput />
            <Field label="Name" value={name} onChangeText={onNameChange} placeholder="Dragon" />
            <Field
              label="Cost — not shown to staff"
              value={cost}
              onChangeText={onCostChange}
              placeholder="1.00"
              keyboardType="decimal-pad"
            />
            <Field
              label="Price"
              value={price}
              onChangeText={onPriceChange}
              placeholder="4.00"
              keyboardType="decimal-pad"
            />

            <BrandButton
              label="Save Item and finish"
              onPress={onSave}
              disabled={!canSave}
              style={[!canSave && styles.buttonDisabled, styles.saveButton]}
            />
          </View>
        </BrandCard>
      </View>
    </SafeAreaView>
  );
}

function Field({
  label,
  iconInput = false,
  ...props
}: {
  label: string;
  iconInput?: boolean;
} & ComponentProps<typeof BrandInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {iconInput ? <IconInput {...props} /> : <BrandInput {...props} />}
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
  saveButton: {
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
});
