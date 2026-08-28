import { useLocalSearchParams, useRouter } from 'expo-router';

import { SaleDetailScreen } from '@/components/SaleDetailScreen';

export default function AdminEditSaleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    saleNumber: string;
    returnTo?: string;
    marketDayId?: string;
  }>();
  const saleNumber = Number(params.saleNumber ?? 0);

  return (
    <SaleDetailScreen
      saleNumber={saleNumber}
      onBack={() => router.back()}
      onSaved={(savedSaleNumber) => {
        if (params.returnTo === 'past' && params.marketDayId) {
          router.replace({
            pathname: '/(grown-up)/past/[id]',
            params: {
              id: params.marketDayId,
              saleSaved: String(savedSaleNumber),
            },
          });
          return;
        }

        router.replace({
          pathname: '/(grown-up)/settings',
          params: { saleSaved: String(savedSaleNumber) },
        });
      }}
    />
  );
}
