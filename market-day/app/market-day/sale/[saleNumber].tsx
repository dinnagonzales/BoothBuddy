import { useLocalSearchParams, useRouter } from 'expo-router';

import { Screen } from '@/components/Screen';
import { SaleDetailScreen } from '@/components/SaleDetailScreen';

export default function ViewOnlySaleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ saleNumber: string }>();
  const saleNumber = Number(params.saleNumber ?? 0);

  return (
    <Screen>
      <SaleDetailScreen saleNumber={saleNumber} readOnly onBack={() => router.back()} />
    </Screen>
  );
}
