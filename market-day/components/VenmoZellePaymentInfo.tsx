import { Image, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { Card } from '@/components/ui';
import { colors } from '@/constants/theme';
import { fonts, radii } from '@/constants/visual';
import type { BusinessSettings } from '@/lib/business-settings';
import { formatMoney } from '@/lib/money';
import { formatZelleContact } from '@/lib/contact-format';
import {
  formatVenmoHandle,
  hasVenmoPaymentInfo,
  hasVenmoZellePaymentInfo,
  hasZellePaymentInfo,
  venmoPayUrl,
} from '@/lib/venmo-payment';

type VenmoZellePaymentInfoProps = {
  settings: BusinessSettings;
  totalCents: number;
  saleLabel?: string;
};

export function VenmoZellePaymentInfo({
  settings,
  totalCents,
  saleLabel,
}: VenmoZellePaymentInfoProps) {
  if (!hasVenmoZellePaymentInfo(settings)) {
    return (
      <Card style={styles.card} className="p-4 mb-3">
        <Text style={styles.emptyTitle}>No payment info yet</Text>
        <Text style={styles.emptyBody}>
          A grown-up can add Venmo or Zelle details in Settings.
        </Text>
      </Card>
    );
  }

  const showZelle = hasZellePaymentInfo(settings);
  const showVenmo = hasVenmoPaymentInfo(settings);
  const venmoQrValue =
    settings.venmoHandle.length > 0
      ? venmoPayUrl(settings.venmoHandle, totalCents, saleLabel)
      : null;

  return (
    <Card style={styles.card} className="p-4 mb-3">
      <Text style={styles.heading}>Scan or send payment</Text>
      <Text style={styles.amountLine}>Amount: {formatMoney(totalCents)}</Text>

      {showZelle ? (
        <View style={[styles.section, showVenmo && styles.sectionDivider]}>
          <Text style={styles.sectionTitle}>Zelle</Text>
          {settings.zelleName ? (
            <Text style={styles.zelleNameLine}>{settings.zelleName}</Text>
          ) : null}
          {settings.zelleName ? (
            <Text style={styles.confirmHint}>Confirm this name in your bank app</Text>
          ) : null}
          {settings.zelleContact ? (
            <Text style={styles.contactLine}>{formatZelleContact(settings.zelleContact)}</Text>
          ) : null}
          {settings.zelleQrUri ? (
            <View style={styles.qrWrap}>
              <Image source={{ uri: settings.zelleQrUri }} style={styles.qrImage} resizeMode="contain" />
            </View>
          ) : null}
        </View>
      ) : null}

      {showVenmo ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Venmo</Text>
          {settings.venmoHandle ? (
            <Text style={styles.contactLine}>{formatVenmoHandle(settings.venmoHandle)}</Text>
          ) : null}
          {settings.venmoQrUri ? (
            <View style={styles.qrWrap}>
              <Image source={{ uri: settings.venmoQrUri }} style={styles.qrImage} resizeMode="contain" />
            </View>
          ) : venmoQrValue ? (
            <View style={styles.qrWrap}>
              <QRCode value={venmoQrValue} size={168} backgroundColor={colors.white} color={colors.ink} />
            </View>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.payOption,
  },
  heading: {
    fontFamily: fonts.body.extraBold,
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.inkSoft,
    textAlign: 'center',
    marginBottom: 4,
  },
  amountLine: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 20,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 14,
  },
  section: {
    alignItems: 'center',
    gap: 8,
  },
  sectionDivider: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E0F5',
  },
  sectionTitle: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 16,
    color: colors.ink,
  },
  zelleNameLine: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 20,
    color: colors.ink,
    textAlign: 'center',
  },
  confirmHint: {
    fontFamily: fonts.body.semiBold,
    fontSize: 12,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  contactLine: {
    fontFamily: fonts.body.bold,
    fontSize: 15,
    color: colors.purpleDark,
    textAlign: 'center',
  },
  qrWrap: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8E0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrImage: {
    width: 168,
    height: 168,
  },
  emptyTitle: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 16,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 6,
  },
  emptyBody: {
    fontFamily: fonts.body.semiBold,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 18,
  },
});
