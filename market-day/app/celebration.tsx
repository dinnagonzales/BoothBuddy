import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, Text, View } from 'react-native';

import { Button, Card } from '@/components/ui';
import { useCart } from '@/context/CartContext';
import { getSaleLineItems } from '@/lib/db/queries';
import { formatMoney } from '@/lib/money';

export default function CelebrationScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { setLines, setEditingSaleId } = useCart();
  const params = useLocalSearchParams<{
    saleId: string;
    itemCount: string;
    totalCents: string;
  }>();

  const itemCount = Number(params.itemCount ?? 0);
  const totalCents = Number(params.totalCents ?? 0);
  const saleId = Number(params.saleId ?? 0);

  const goHome = () => {
    router.replace('/');
  };

  const fixSale = () => {
    const lines = getSaleLineItems(db, saleId);
    setLines(lines);
    setEditingSaleId(saleId);
    router.replace('/sell');
  };

  return (
    <Pressable className="flex-1 bg-black/35 items-center justify-center p-6" onPress={goHome}>
      <Pressable onPress={(event) => event.stopPropagation()}>
        <Card className="w-full items-center p-6 rounded-3xl bg-background">
          <View className="w-[90px] h-[90px] rounded-full bg-warning items-center justify-center mb-3.5">
            <Text className="text-[44px]">✅</Text>
          </View>
          <Text className="text-2xl font-bold text-foreground mb-1">Sold!</Text>
          <Text className="text-muted font-bold">
            {itemCount} items · {formatMoney(totalCents)}
          </Text>
          <Button variant="outline" className="mt-4 rounded-2xl" onPress={fixSale}>
            <Button.Label className="font-bold text-accent">Fix</Button.Label>
          </Button>
          <Text className="text-muted text-[13px] font-semibold mt-4">
            Tap anywhere else to keep going
          </Text>
        </Card>
      </Pressable>
    </Pressable>
  );
}
