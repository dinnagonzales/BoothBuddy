import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Screen, ScreenHeader } from '@/components/Screen';
import { Button, Card, Chip, Input, cn } from '@/components/ui';
import { useCart } from '@/context/CartContext';
import { createSale, deleteSale, getActiveMarketDay } from '@/lib/db/queries';
import { formatMoney, parseMoneyInput } from '@/lib/money';
import type { PaymentMethod } from '@/lib/types';

const BILLS = [100, 500, 1000, 2000, 10000];

export default function PaymentScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { lines, totalCents, clearCart, editingSaleId } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashReceivedCents, setCashReceivedCents] = useState(totalCents);

  const changeCents = useMemo(
    () => Math.max(cashReceivedCents - totalCents, 0),
    [cashReceivedCents, totalCents],
  );

  const completeSale = () => {
    const marketDay = getActiveMarketDay(db);
    if (!marketDay || lines.length === 0) return;

    const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

    if (editingSaleId) {
      deleteSale(db, editingSaleId);
    }

    const sale = createSale(db, {
      marketDayId: marketDay.id,
      lines,
      paymentMethod,
      cashReceivedCents: paymentMethod === 'cash' ? cashReceivedCents : null,
    });

    clearCart();
    router.replace({
      pathname: '/celebration',
      params: {
        saleId: String(sale.id),
        itemCount: String(itemCount),
        totalCents: String(sale.totalCents),
      },
    });
  };

  return (
    <Screen>
      <ScreenHeader title="How'd they pay?" onBack={() => router.back()} />

      <View className="items-center my-3">
        <Text className="text-[13px] font-extrabold uppercase text-muted">Total</Text>
        <Text className="text-[44px] font-bold text-foreground">{formatMoney(totalCents)}</Text>
      </View>

      <Card
        className={cn('p-4 mb-3 border-[3px]', paymentMethod === 'cash' ? 'border-success' : 'border-transparent')}>
        <Pressable className="flex-row justify-between items-center" onPress={() => setPaymentMethod('cash')}>
          <Text className="text-base font-semibold text-foreground">💵 Cash</Text>
          <View
            className={cn(
              'w-[26px] h-[26px] rounded-lg border-2 border-success items-center justify-center',
              paymentMethod === 'cash' ? 'bg-success' : 'bg-surface',
            )}>
            {paymentMethod === 'cash' ? <Text className="text-white font-bold">✓</Text> : null}
          </View>
        </Pressable>

        {paymentMethod === 'cash' ? (
          <>
            <View className="flex-row items-center gap-2 mt-2.5">
              <Button
                size="sm"
                isIconOnly
                variant="secondary"
                onPress={() => setCashReceivedCents((value) => Math.max(value - 100, 0))}>
                <Button.Label>−</Button.Label>
              </Button>
              <Input
                className="flex-1 text-center text-lg font-semibold"
                keyboardType="decimal-pad"
                value={formatMoney(cashReceivedCents)}
                onChangeText={(text) => setCashReceivedCents(parseMoneyInput(text))}
              />
              <Button
                size="sm"
                isIconOnly
                variant="secondary"
                onPress={() => setCashReceivedCents((value) => value + 100)}>
                <Button.Label>+</Button.Label>
              </Button>
            </View>
            <View className="flex-row flex-wrap gap-1.5 mt-2">
              {BILLS.map((cents) => (
                <Chip key={cents} variant="secondary" onPress={() => setCashReceivedCents(cents)}>
                  <Chip.Label>{formatMoney(cents)}</Chip.Label>
                </Chip>
              ))}
            </View>
            <Text className="text-center text-lg font-semibold text-success mt-2">
              Change: {formatMoney(changeCents)}
            </Text>
          </>
        ) : null}
      </Card>

      <Card
        className={cn(
          'p-4 mb-3 border-[3px]',
          paymentMethod === 'venmo_zelle' ? 'border-success' : 'border-transparent',
        )}>
        <Pressable
          className="flex-row justify-between items-center"
          onPress={() => setPaymentMethod('venmo_zelle')}>
          <Text className="text-base font-semibold text-foreground">📱 Venmo / Zelle</Text>
          <View
            className={cn(
              'w-[26px] h-[26px] rounded-lg border-2 border-success items-center justify-center',
              paymentMethod === 'venmo_zelle' ? 'bg-success' : 'bg-surface',
            )}>
            {paymentMethod === 'venmo_zelle' ? (
              <Text className="text-white font-bold">✓</Text>
            ) : null}
          </View>
        </Pressable>
      </Card>

      <Button size="lg" className="mt-auto mb-2 rounded-[18px]" onPress={completeSale}>
        <Button.Label className="text-[17px] font-bold">Complete sale ✓</Button.Label>
      </Button>
    </Screen>
  );
}
