import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tokens } from '@/theme/tokens';

import { PassCodeSheet } from '@/components/PassCodeSheet';
import { Button, Card } from '@/components/ui';
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
          <Text style={styles.closeLabel}>✕</Text>
        </Pressable>

        <View style={styles.badge}>
          <Text style={styles.badgeEmoji}>✅</Text>
        </View>
        <Text style={styles.title}>{isPreorder ? 'Preorder saved!' : 'Sold!'}</Text>
        <Text style={styles.subtitle}>
          {isPreorder && invoiceNumber != null
            ? `Invoice #${invoiceNumber} • ${formatMoney(totalCents)}`
            : `${itemCount} ${itemLabel} • ${formatMoney(totalCents)}`}
        </Text>
        <Text style={styles.prompt}>Everything look right?</Text>
        <Button size="lg" variant="primary" style={styles.dashboardButton} onPress={goHome}>
          <Button.Label style={styles.dashboardButtonLabel}>🏠 Go to Dashboard</Button.Label>
        </Button>
        <Pressable style={styles.editButton} onPress={editSale}>
          <Text style={styles.editLabel}>
            {isPreorder ? '✏️ Edit preorder' : '✏️ Edit this sale'}
          </Text>
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
  closeLabel: {
    fontFamily: fonts.heading.bold,
    fontSize: 20,
    color: colors.inkSoft,
  },
  badge: {
    width: 90,
    height: 90,
    borderRadius: radii.celebrationBadge,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  badgeEmoji: {
    fontSize: 44,
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
  editHint: {
    fontFamily: fonts.body.bold,
    fontSize: 12,
    color: colors.inkSoft,
    marginTop: 4,
  },
});
