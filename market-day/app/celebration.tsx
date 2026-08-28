import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, Text, View } from 'react-native';

import { Button, Card } from '@/components/ui';
import { useCart } from '@/context/CartContext';
import { getSale, getSaleLineItems } from '@/lib/db/queries';
import { formatMoney } from '@/lib/money';

export default function CelebrationScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { setLines, setEditingSaleId, setInvoiceNumber } = useCart();
  const params = useLocalSearchParams<{
    saleId: string;
    itemCount: string;
    totalCents: string;
  }>();

  const itemCount = Number(params.itemCount ?? 0);
  const totalCents = Number(params.totalCents ?? 0);
  const saleId = Number(params.saleId ?? 0);
  const itemLabel = itemCount === 1 ? 'item' : 'items';

  const goHome = () => {
    router.replace('/');
  };

  const editSale = () => {
    void (async () => {
      const [lines, sale] = await Promise.all([
        getSaleLineItems(db, saleId),
        getSale(db, saleId),
      ]);
      setLines(lines);
      setEditingSaleId(saleId);
      setInvoiceNumber(sale?.saleNumber ?? null);
      router.replace({
        pathname: '/sell',
        params: { invoiceNumber: String(sale?.saleNumber ?? '') },
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
        <Text className="text-2xl font-bold text-foreground mb-1">Sold!</Text>
        <Text className="text-muted font-bold">
          {itemCount} {itemLabel} • {formatMoney(totalCents)}
        </Text>
        <Text className="text-muted text-xs font-bold tracking-wide mt-4 uppercase">
          Everything look right?
        </Text>
        <Button size="lg" variant="primary" className="mt-4 w-full rounded-2xl" onPress={goHome}>
          <Button.Label className="font-bold">🏠 Go to Dashboard</Button.Label>
        </Button>
        <Pressable className="mt-4 items-center" onPress={editSale}>
          <Text className="font-bold text-accent">✏️ Edit this sale</Text>
          <Text className="text-muted text-xs mt-1">wrong item or price?</Text>
        </Pressable>
      </Card>
    </View>
  );
}
