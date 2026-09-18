import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, Home, Pencil, X } from 'lucide-react-native';
import { tokens } from '@/theme/tokens';

import { PassCodeSheet } from '@/components/PassCodeSheet';
import { Card } from '@/components/ui';
import { UiIcon } from '@/components/ui/UiIcon';
import { colors } from '@/constants/theme';
import { fonts, radii } from '@/constants/visual';
import { useCart } from '@/context/CartContext';
import { useGrownUpSession } from '@/context/GrownUpSessionContext';
import { getSale, getSaleLineItems } from '@/lib/db/queries';
import { getPasscodeGateEnabled } from '@/lib/db/passcode-gate-settings';
import { deviceParentalGate } from '@/lib/device-parental-gate';
import { cashReceivedForEditedSale } from '@/lib/sale-edit';
import { formatMoney } from '@/lib/money';
import { resetAppForForgottenCode } from '@/lib/reset-app';

export default function CelebrationScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { unlocked, unlock } = useGrownUpSession();
  const {
    setLines,
    setEditingSaleId,
    setEditingPaymentMethod,
    setEditingCashReceivedCents,
    setEditingChangeKept,
    setInvoiceNumber,
    setSaleName,
    setSaleNotes,
  } = useCart();
  const params = useLocalSearchParams<{
    saleId: string;
    itemCount: string;
    totalCents: string;
    isPreorder?: string;
    invoiceNumber?: string;
  }>();

  const [passCodeOpen, setPassCodeOpen] = useState(false);
  const [pendingPreorderSaleNumber, setPendingPreorderSaleNumber] = useState<number | null>(null);

  const itemCount = Number(params.itemCount ?? 0);
  const totalCents = Number(params.totalCents ?? 0);
  const saleId = Number(params.saleId ?? 0);
  const isPreorder = params.isPreorder === '1';
  const invoiceNumber = params.invoiceNumber ? Number(params.invoiceNumber) : null;
  const itemLabel = itemCount === 1 ? 'item' : 'items';

  const goHome = () => {
    router.replace('/');
  };

  const openPreorderEdit = (saleNumber: number) => {
    if (router.canDismiss()) {
      router.dismiss();
    }
    router.push({
      pathname: '/sale/[saleNumber]',
      params: {
        saleNumber: String(saleNumber),
        returnTo: 'preorders',
      },
    });
  };

  const editSale = () => {
    void (async () => {
      const sale = await getSale(db, saleId);
      if (!sale) return;

      if (isPreorder) {
        const gateEnabled = await getPasscodeGateEnabled(db);
        if (!gateEnabled || unlocked) {
          openPreorderEdit(sale.saleNumber);
          return;
        }
        setPendingPreorderSaleNumber(sale.saleNumber);
        setPassCodeOpen(true);
        return;
      }

      const lines = await getSaleLineItems(db, saleId);
      setLines(lines);
      setEditingSaleId(saleId);
      setEditingPaymentMethod(sale.paymentMethod ?? null);
      setEditingCashReceivedCents(
        cashReceivedForEditedSale(sale.paymentMethod, sale.cashReceivedCents, sale.totalCents),
      );
      setEditingChangeKept(sale.changeKept);
      setInvoiceNumber(sale.saleNumber ?? null);
      setSaleName(sale.name ?? '');
      setSaleNotes(sale.notes ?? '');
      router.replace({
        pathname: '/sell',
        params: { invoiceNumber: String(sale.saleNumber) },
      });
    })();
  };

  return (
    <View style={styles.overlay}>
      <Card style={styles.card}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={styles.closeButton}
          hitSlop={8}
          onPress={goHome}>
          <UiIcon icon={X} size={18} color={colors.inkSoft} />
        </Pressable>

        <View style={styles.badge}>
          <UiIcon icon={CheckCircle2} size={40} color={colors.ink} />
        </View>
        <Text style={styles.title}>{isPreorder ? 'Preorder saved!' : 'Sold!'}</Text>
        <Text style={styles.subtitle}>
          {isPreorder && invoiceNumber != null
            ? `Invoice #${invoiceNumber} • ${formatMoney(totalCents)}`
            : `${itemCount} ${itemLabel} • ${formatMoney(totalCents)}`}
        </Text>
        <Text style={styles.prompt}>Need to change something?</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go to Dashboard"
          onPress={goHome}
          style={({ pressed }) => [
            styles.dashboardButton,
            pressed && styles.dashboardButtonPressed,
          ]}>
          <View style={styles.dashboardButtonRow}>
            <UiIcon icon={Home} size={18} color={colors.ink} />
            <Text style={styles.dashboardButtonLabel}>Go to Dashboard</Text>
          </View>
        </Pressable>
        <Pressable style={styles.editButton} onPress={editSale}>
          <View style={styles.editLabelRow}>
            <UiIcon icon={Pencil} size={18} color={colors.purpleDark} />
            <Text style={styles.editLabel}>
              {isPreorder ? 'Edit preorder' : 'Edit this sale'}
            </Text>
          </View>
          <Text style={styles.editHint}>
            {isPreorder ? 'name, notes, or payment' : 'wrong item or price?'}
          </Text>
        </Pressable>
      </Card>

      <PassCodeSheet
        visible={passCodeOpen}
        subtitle="Enter your code to edit this preorder."
        onClose={() => {
          setPassCodeOpen(false);
          setPendingPreorderSaleNumber(null);
        }}
        onSubmit={(code) => deviceParentalGate.verify(code)}
        onSuccess={() => {
          unlock();
          setPassCodeOpen(false);
          if (pendingPreorderSaleNumber != null) {
            openPreorderEdit(pendingPreorderSaleNumber);
            setPendingPreorderSaleNumber(null);
          }
        }}
        onForgotCode={async () => {
          await resetAppForForgottenCode(db, deviceParentalGate);
          setPassCodeOpen(false);
          setPendingPreorderSaleNumber(null);
          router.replace('/setup');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: tokens.shadow.scrim,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    backgroundColor: colors.screen,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: 90,
    height: 90,
    borderRadius: radii.celebrationBadge,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...Platform.select({
      web: { boxShadow: `0 5px 0 ${colors.yellowDark}` },
      default: {
        shadowColor: colors.yellowDark,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 0,
      },
    }),
  },
  title: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 24,
    color: colors.ink,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.body.bold,
    color: colors.inkSoft,
  },
  prompt: {
    fontFamily: fonts.body.bold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.inkSoft,
    marginTop: 16,
  },
  dashboardButton: {
    marginTop: 16,
    width: '100%',
    borderRadius: radii.completeBtn,
    backgroundColor: colors.grayLight,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dashboardButtonPressed: {
    opacity: 0.85,
  },
  dashboardButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dashboardButtonLabel: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 16,
    color: colors.ink,
  },
  editButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  editLabel: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 15,
    color: colors.purpleDark,
  },
  editLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editHint: {
    fontFamily: fonts.body.bold,
    fontSize: 12,
    color: colors.inkSoft,
    marginTop: 4,
  },
});
