import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { PassCodeSheet } from '@/components/PassCodeSheet';
import { Button, Card } from '@/components/ui';
import { useCart } from '@/context/CartContext';
import { useGrownUpSession } from '@/context/GrownUpSessionContext';
import { getSale, getSaleLineItems } from '@/lib/db/queries';
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
        if (unlocked) {
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
    <View className="flex-1 bg-black/35 items-center justify-center p-6">
      <Card className="w-full items-center p-6 rounded-3xl bg-background">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          className="absolute top-4 right-4 w-8 h-8 items-center justify-center"
          hitSlop={8}
          onPress={goHome}
        >
          <Text className="text-xl font-bold text-muted">✕</Text>
        </Pressable>

        <View className="w-[90px] h-[90px] rounded-full bg-warning items-center justify-center mb-3.5">
          <Text className="text-[44px]">✅</Text>
        </View>
        <Text className="text-2xl font-bold text-foreground mb-1">
          {isPreorder ? 'Preorder saved!' : 'Sold!'}
        </Text>
        <Text className="text-muted font-bold">
          {isPreorder && invoiceNumber != null
            ? `Invoice #${invoiceNumber} • ${formatMoney(totalCents)}`
            : `${itemCount} ${itemLabel} • ${formatMoney(totalCents)}`}
        </Text>
        <Text className="text-muted text-xs font-bold tracking-wide mt-4 uppercase">
          Everything look right?
        </Text>
        <Button size="lg" variant="primary" className="mt-4 w-full rounded-2xl" onPress={goHome}>
          <Button.Label className="font-bold">🏠 Go to Dashboard</Button.Label>
        </Button>
        <Pressable className="mt-4 items-center" onPress={editSale}>
          <Text className="font-bold text-accent">
            {isPreorder ? '✏️ Edit preorder' : '✏️ Edit this sale'}
          </Text>
          <Text className="text-muted text-xs mt-1">
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
